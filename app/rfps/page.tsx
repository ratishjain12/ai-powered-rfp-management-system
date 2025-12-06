import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RFPTable } from "@/components/rfp/rfp-table";
import { prisma } from "@/lib/db/prisma";
import { Plus } from "lucide-react";

async function getAllRFPs() {
  const rfps = await prisma.rFP.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendors: true,
    },
  });

  return rfps.map((rfp) => ({
    ...rfp,
    vendorCount: rfp.vendors.length,
  }));
}

export default async function RFPsPage() {
  const rfps = await getAllRFPs();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All RFPs</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your requests for proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/rfps/new">
            <Plus className="mr-2 h-4 w-4" />
            New RFP
          </Link>
        </Button>
      </div>

      {rfps.length === 0 ? (
        <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">No RFPs found</p>
          <Button asChild>
            <Link href="/rfps/new">Create your first RFP</Link>
          </Button>
        </div>
      ) : (
        <RFPTable rfps={rfps} />
      )}
    </div>
  );
}
