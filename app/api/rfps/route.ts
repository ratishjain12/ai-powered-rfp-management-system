import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const rfps = await prisma.rFP.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendors: {
          include: {
            vendor: true,
          },
        },
      },
    });

    const rfpsWithVendorCount = rfps.map((rfp) => ({
      ...rfp,
      vendorCount: rfp.vendors.length,
    }));

    return NextResponse.json(rfpsWithVendorCount);
  } catch (error) {
    console.error("Error fetching RFPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFPs" },
      { status: 500 }
    );
  }
}
