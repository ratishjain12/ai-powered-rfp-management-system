import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        vendors: {
          include: {
            vendor: true,
          },
        },
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

    return NextResponse.json(rfp);
  } catch (error) {
    console.error("Error fetching RFP:", error);
    return NextResponse.json({ error: "Failed to fetch RFP" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const rfp = await prisma.rFP.update({
      where: { id },
      data: body,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/rfps");
    revalidatePath(`/rfps/${id}`);

    return NextResponse.json(rfp);
  } catch (error) {
    console.error("Error updating RFP:", error);
    return NextResponse.json(
      { error: "Failed to update RFP" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.rFP.delete({
      where: { id },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/rfps");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting RFP:", error);
    return NextResponse.json(
      { error: "Failed to delete RFP" },
      { status: 500 }
    );
  }
}
