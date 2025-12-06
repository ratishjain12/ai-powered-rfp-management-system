import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { callGroq } from "@/lib/ai";
import { getRecommendationPrompt } from "@/lib/ai/prompts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    if (rfp.proposals.length === 0) {
      return NextResponse.json(
        { error: "No proposals found for this RFP" },
        { status: 404 }
      );
    }

    const proposalsData = rfp.proposals.map((proposal) => ({
      vendorName: proposal.vendor.name,
      totalCost: proposal.totalCost,
      deliveryTerms: proposal.deliveryTerms,
      paymentTerms: proposal.paymentTerms,
      warranty: proposal.warranty,
      completenessScore: proposal.completenessScore,
    }));

    const prompt = getRecommendationPrompt(rfp.title, proposalsData);
    const aiResponse = await callGroq(prompt);

    let recommendation;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to generate recommendation. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
