import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RFPVendorSelector } from "@/components/rfp/rfp-vendor-selector";
import { RFPActionMenu } from "@/components/rfp/rfp-action-menu";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Calendar, Package } from "lucide-react";
import Link from "next/link";

async function getRFP(id: string) {
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
  return rfp;
}

async function getAllVendors() {
  return await prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function RFPDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfp = await getRFP(id);
  const vendors = await getAllVendors();

  if (!rfp) {
    notFound();
  }

  const items = JSON.parse(rfp.items || "[]");
  const selectedVendorIds = rfp.vendors.map((v) => v.vendorId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{rfp.title}</h1>
            <Badge>{rfp.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            Created{" "}
            {formatDistanceToNow(new Date(rfp.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/rfps">Back to RFPs</Link>
          </Button>
          <RFPActionMenu rfpId={id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rfp.description && (
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {rfp.description}
                </p>
              </div>
            )}
            {rfp.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">Budget</div>
                  <div className="text-sm text-muted-foreground">
                    {rfp.budget}
                  </div>
                </div>
              </div>
            )}
            {rfp.deliveryTimeline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">Delivery Timeline</div>
                  <div className="text-sm text-muted-foreground">
                    {rfp.deliveryTimeline}
                  </div>
                </div>
              </div>
            )}
            {rfp.paymentTerms && (
              <div>
                <div className="font-semibold">Payment Terms</div>
                <div className="text-sm text-muted-foreground">
                  {rfp.paymentTerms}
                </div>
              </div>
            )}
            {rfp.warranty && (
              <div>
                <div className="font-semibold">Warranty</div>
                <div className="text-sm text-muted-foreground">
                  {rfp.warranty}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </div>
                      {item.specifications && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.specifications}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>Select vendors to send this RFP to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RFPVendorSelector
            rfpId={id}
            vendors={vendors}
            selectedVendorIds={selectedVendorIds}
          />
          {rfp.vendors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Selected Vendors</h3>
              <div className="space-y-2">
                {rfp.vendors.map((rv) => (
                  <div
                    key={rv.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{rv.vendor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {rv.vendor.email}
                      </div>
                    </div>
                    <Badge variant="outline">{rv.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {rfp.proposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>
              {rfp.proposals.length} proposal
              {rfp.proposals.length !== 1 ? "s" : ""} received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/rfps/${id}/compare`}>View Comparison</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
