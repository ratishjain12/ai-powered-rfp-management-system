import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyResendWebhookSignature } from "@/lib/email/resend";

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
    const fromEmail = emailData.from?.email || emailData.from_email || "";
    const subject = emailData.subject || "";
    const bodyText = emailData.text || emailData.html || "";

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

    return NextResponse.json({ success: true, rawEmailId: rawEmail.id });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
