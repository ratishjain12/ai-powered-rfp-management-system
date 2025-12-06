import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendRFPEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { vendorIds } = body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return NextResponse.json(
        { error: "At least one vendor must be selected" },
        { status: 400 }
      );
    }

    const rfp = await prisma.rFP.findUnique({
      where: { id },
    });

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
    });

    if (vendors.length !== vendorIds.length) {
      return NextResponse.json(
        { error: "One or more vendors not found" },
        { status: 404 }
      );
    }

    const items = JSON.parse(rfp.items || "[]");

    const emailText = `Request for Proposal: ${rfp.title}

${rfp.description ? `Description:\n${rfp.description}\n\n` : ""}Items Requested:
${items
  .map((item: { name: string; quantity: string; specifications: string }) => {
    let itemText = `- ${item.name} (Quantity: ${item.quantity})`;
    if (item.specifications) {
      itemText += `\n  Specifications: ${item.specifications}`;
    }
    return itemText;
  })
  .join("\n")}

${rfp.budget ? `Budget: ${rfp.budget}\n` : ""}${
      rfp.deliveryTimeline ? `Delivery Timeline: ${rfp.deliveryTimeline}\n` : ""
    }${rfp.paymentTerms ? `Payment Terms: ${rfp.paymentTerms}\n` : ""}${
      rfp.warranty ? `Warranty Requirements: ${rfp.warranty}\n` : ""
    }
Please submit your proposal by replying to this email.`;

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #0066cc;">
    <h1 style="color: #1a1a1a; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Request for Proposal</h1>
    <h2 style="color: #333333; margin: 0; font-size: 20px; font-weight: 500;">${
      rfp.title
    }</h2>
  </div>
  
  ${
    rfp.description
      ? `<div style="margin-bottom: 24px; padding: 16px; background-color: #f8f9fa; border-radius: 6px;">
    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a1a;">Description:</p>
    <p style="margin: 0; color: #666666;">${rfp.description}</p>
  </div>`
      : ""
  }
  
  <div style="margin-bottom: 24px;">
    <h3 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Items Requested:</h3>
    <ul style="padding-left: 20px; margin: 0;">
      ${items
        .map(
          (item: {
            name: string;
            quantity: string;
            specifications: string;
          }) => `
      <li style="margin-bottom: 12px; color: #333333;">
        <strong style="color: #1a1a1a;">${item.name}</strong> - Quantity: ${
            item.quantity
          }
        ${
          item.specifications
            ? `<br/><span style="color: #666666; font-size: 14px; display: block; margin-top: 4px;">Specifications: ${item.specifications}</span>`
            : ""
        }
      </li>`
        )
        .join("")}
    </ul>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
    ${
      rfp.budget
        ? `<p style="margin: 8px 0; color: #333333;"><strong style="color: #1a1a1a;">Budget:</strong> ${rfp.budget}</p>`
        : ""
    }
    ${
      rfp.deliveryTimeline
        ? `<p style="margin: 8px 0; color: #333333;"><strong style="color: #1a1a1a;">Delivery Timeline:</strong> ${rfp.deliveryTimeline}</p>`
        : ""
    }
    ${
      rfp.paymentTerms
        ? `<p style="margin: 8px 0; color: #333333;"><strong style="color: #1a1a1a;">Payment Terms:</strong> ${rfp.paymentTerms}</p>`
        : ""
    }
    ${
      rfp.warranty
        ? `<p style="margin: 8px 0; color: #333333;"><strong style="color: #1a1a1a;">Warranty Requirements:</strong> ${rfp.warranty}</p>`
        : ""
    }
  </div>
  
  <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666666; font-size: 14px;">
    Please submit your proposal by replying to this email.
  </p>
</body>
</html>`;

    const results = [];
    for (const vendor of vendors) {
      try {
        await sendRFPEmail({
          to: vendor.email,
          subject: `${rfp.title} [REF:${rfp.id}]`,
          html: emailHtml,
          text: emailText,
          replyTo: process.env.RESEND_REPLY_TO || "rfp@updates.ratishfolio.com",
        });

        await prisma.rFPVendor.upsert({
          where: {
            rfpId_vendorId: {
              rfpId: id,
              vendorId: vendor.id,
            },
          },
          create: {
            rfpId: id,
            vendorId: vendor.id,
            sentAt: new Date(),
            status: "sent",
          },
          update: {
            sentAt: new Date(),
            status: "sent",
          },
        });

        results.push({ vendorId: vendor.id, success: true });
      } catch (error) {
        console.error(`Failed to send email to ${vendor.email}:`, error);
        results.push({
          vendorId: vendor.id,
          success: false,
          error: "Failed to send email",
        });
      }
    }

    await prisma.rFP.update({
      where: { id },
      data: { status: "sent" },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error sending RFP:", error);
    return NextResponse.json({ error: "Failed to send RFP" }, { status: 500 });
  }
}
