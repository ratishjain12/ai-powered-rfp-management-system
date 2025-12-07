import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyResendWebhookSignature, resend } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  try {
    const svix_id = request.headers.get("svix-id") ?? "";
    const svix_timestamp = request.headers.get("svix-timestamp") ?? "";
    const svix_signature = request.headers.get("svix-signature") ?? "";
    const body = await request.text();

    if (
      !verifyResendWebhookSignature(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      })
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);

    if (payload.type !== "email.received") {
      return NextResponse.json({ success: true });
    }

    const emailData = payload.data;

    // Robust email extraction
    let fromEmail = "";
    if (typeof emailData.from === "string") {
      fromEmail = emailData.from;
    } else if (typeof emailData.from === "object" && emailData.from) {
      fromEmail = emailData.from.email || "";
    } else {
      fromEmail = emailData.from_email || "";
    }

    // Extract pure email if format is "Name <email@example.com>"
    const emailMatch = fromEmail.match(/<(.+)>/);
    if (emailMatch) {
      fromEmail = emailMatch[1];
    }
    fromEmail = fromEmail.trim();

    const subject = emailData.subject || "";
    let bodyText = emailData.text || emailData.html || "";

    if (!bodyText && emailData.email_id) {
      try {
        const { data: fullEmail, error } = await resend.emails.receiving.get(
          emailData.email_id
        );
        console.log(emailData.email_id);
        console.log("Full email:", fullEmail);
        if (error) {
          console.error("Error fetching full email content:", error);
        }
        if (fullEmail) {
          bodyText = fullEmail.text || fullEmail.html || "";
        }
      } catch (fetchError) {
        console.error("Failed to fetch full email content:", fetchError);
      }
    }

    const vendor = await prisma.vendor.findUnique({
      where: { email: fromEmail },
    });

    if (!vendor) {
      console.log(`No vendor found for email: ${fromEmail}`);
      return NextResponse.json({ success: true });
    }

    // Try to extract RFP ID from subject line [REF:rfp_id]
    const refMatch = subject.match(/\[REF:([a-zA-Z0-9]+)\]/);
    const rfpId = refMatch ? refMatch[1] : null;

    let rfpVendor;

    if (rfpId) {
      // If we found an ID, look for that specific RFP link
      rfpVendor = await prisma.rFPVendor.findUnique({
        where: {
          rfpId_vendorId: {
            rfpId: rfpId,
            vendorId: vendor.id,
          },
        },
        include: {
          rfp: true,
        },
      });
    }

    // Fallback: If no ID found or invalid ID, look for most recent active RFP
    if (!rfpVendor) {
      console.log(
        "No valid REF ID found, falling back to most recent active RFP"
      );
      rfpVendor = await prisma.rFPVendor.findFirst({
        where: {
          vendorId: vendor.id,
          status: { in: ["sent", "responded"] },
        },
        include: {
          rfp: true,
        },
        orderBy: {
          sentAt: "desc",
        },
      });
    }

    if (!rfpVendor) {
      console.log(`No RFP found for vendor: ${vendor.id}`);
      return NextResponse.json({ success: true });
    }

    const rawEmail = await prisma.rawEmail.create({
      data: {
        rfpId: rfpVendor.rfpId,
        vendorId: vendor.id,
        subject,
        fromEmail,
        body: bodyText,
        attachments: emailData.attachments
          ? JSON.stringify(emailData.attachments)
          : null,
      },
    });

    await prisma.rFPVendor.update({
      where: { id: rfpVendor.id },
      data: { status: "responded" },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/rfps/${rfpVendor.rfpId}`);
    revalidatePath("/rfps");

    return NextResponse.json({ success: true, rawEmailId: rawEmail.id });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
