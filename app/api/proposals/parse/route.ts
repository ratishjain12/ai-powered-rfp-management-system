import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { callGroq } from "@/lib/ai";
import { getProposalParsingPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawEmailId } = body;

    if (!rawEmailId) {
      return NextResponse.json(
        { error: "rawEmailId is required" },
        { status: 400 }
      );
    }

    const rawEmail = await prisma.rawEmail.findUnique({
      where: { id: rawEmailId },
      include: {
        rfp: true,
      },
    });

    if (!rawEmail || !rawEmail.rfp) {
      return NextResponse.json(
        { error: "Raw email or RFP not found" },
        { status: 404 }
      );
    }

    const rfpItems = JSON.parse(rawEmail.rfp.items || "[]");
    const prompt = getProposalParsingPrompt(rawEmail.body, rfpItems);
    const aiResponse = await callGroq(prompt);

    let parsedData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse proposal. Please try again." },
        { status: 500 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        rawEmailId,
        rfpId: rawEmail.rfpId!,
        vendorId: rawEmail.vendorId!,
        totalCost: parsedData.totalCost || null,
        deliveryTerms: parsedData.deliveryTerms || null,
        paymentTerms: parsedData.paymentTerms || null,
        warranty: parsedData.warranty || null,
        lineItems: parsedData.lineItems
          ? JSON.stringify(parsedData.lineItems)
          : null,
        completenessScore: parsedData.completenessScore || null,
      },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/rfps/${rawEmail.rfpId}`);
    revalidatePath(`/rfps/${rawEmail.rfpId}/compare`);

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Error parsing proposal:", error);
    return NextResponse.json(
      { error: "Failed to parse proposal" },
      { status: 500 }
    );
  }
}
