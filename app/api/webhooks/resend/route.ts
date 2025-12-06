import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyResendWebhookSignature } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("resend-signature") || "";
    const body = await request.text();

    if (!verifyResendWebhookSignature(body, signature)) {
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

    const rfpVendor = await prisma.rFPVendor.findFirst({
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
