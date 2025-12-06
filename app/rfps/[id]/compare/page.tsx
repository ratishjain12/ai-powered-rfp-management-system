import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { AIRecommendation } from "@/components/rfp/ai-recommendation";

async function getRFP(id: string) {
  const rfp = await prisma.rFP.findUnique({
    where: { id },
    include: {
      proposals: {
        include: {
          vendor: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  return rfp;
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfp = await getRFP(id);

  if (!rfp) {
    notFound();
  }

  if (rfp.proposals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Compare Proposals</h1>
          <Button asChild variant="outline">
            <Link href={`/rfps/${id}`}>Back to RFP</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No proposals received yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compare Proposals</h1>
          <p className="text-muted-foreground mt-2">{rfp.title}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/rfps/${id}`}>Back to RFP</Link>
        </Button>
      </div>

      <AIRecommendation rfpId={id} />

      <Card>
        <CardHeader>
          <CardTitle>Proposal Comparison</CardTitle>
          <CardDescription>
            Side-by-side comparison of {rfp.proposals.length} proposal{rfp.proposals.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Delivery Terms</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Completeness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfp.proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">{proposal.vendor.name}</TableCell>
                    <TableCell>{proposal.totalCost || "—"}</TableCell>
                    <TableCell>{proposal.deliveryTerms || "—"}</TableCell>
                    <TableCell>{proposal.paymentTerms || "—"}</TableCell>
                    <TableCell>{proposal.warranty || "—"}</TableCell>
                    <TableCell>
                      {proposal.completenessScore !== null ? (
                        <Badge variant={proposal.completenessScore >= 0.8 ? "default" : "secondary"}>
                          {Math.round(proposal.completenessScore * 100)}%
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

