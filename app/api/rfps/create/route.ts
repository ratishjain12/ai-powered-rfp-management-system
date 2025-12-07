import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { callGroq } from "@/lib/ai";
import { getRFPExtractionPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { naturalLanguage } = body;

    if (!naturalLanguage || typeof naturalLanguage !== "string") {
      return NextResponse.json(
        { error: "naturalLanguage is required" },
        { status: 400 }
      );
    }

    const prompt = getRFPExtractionPrompt(naturalLanguage);
    const aiResponse = await callGroq(prompt);

    let extractedData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    const rfp = await prisma.rFP.create({
      data: {
        title: extractedData.title || "Untitled RFP",
        description: extractedData.description || null,
        budget: extractedData.budget || null,
        deliveryTimeline: extractedData.deliveryTimeline || null,
        paymentTerms: extractedData.paymentTerms || null,
        warranty: extractedData.warranty || null,
        items: JSON.stringify(extractedData.items || []),
        status: "draft",
      },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/rfps");

    return NextResponse.json(rfp, { status: 201 });
  } catch (error) {
    console.error("Error creating RFP:", error);
    return NextResponse.json(
      { error: "Failed to create RFP" },
      { status: 500 }
    );
  }
}
