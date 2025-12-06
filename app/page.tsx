import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { RFPTable } from "@/components/rfp/rfp-table";
import { prisma } from "@/lib/db/prisma";
import {
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Users,
} from "lucide-react";

async function getDashboardData() {
  const [rfps, totalRfps, activeRfps, totalVendors] = await Promise.all([
    prisma.rFP.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        vendors: true,
      },
    }),
    prisma.rFP.count(),
    prisma.rFP.count({
      where: { status: { in: ["draft", "sent"] } },
    }),
    prisma.vendor.count(),
  ]);

  const rfpsWithCounts = rfps.map((rfp) => ({
    ...rfp,
    vendorCount: rfp.vendors.length,
  }));

  return {
    rfps: rfpsWithCounts,
    stats: {
      totalRfps,
      activeRfps,
      completedRfps: totalRfps - activeRfps,
      totalVendors,
    },
  };
}

export default async function HomePage() {
  const { rfps, stats } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/rfps/new">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Section - Simplified & Integrated */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-5 shadow-sm flex items-start justify-between hover:border-primary/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Active Requests
            </p>
            <div className="text-3xl font-bold text-foreground">
              {stats.activeRfps}
            </div>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-sm flex items-start justify-between hover:border-primary/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Completed
            </p>
            <div className="text-3xl font-bold text-foreground">
              {stats.completedRfps}
            </div>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-sm flex items-start justify-between hover:border-primary/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Vendor Network
            </p>
            <div className="text-3xl font-bold text-foreground">
              {stats.totalVendors}
            </div>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/rfps" className="flex items-center gap-1">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {rfps.length === 0 ? (
          <Card className="border-dashed bg-muted/10 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-background p-3 shadow-sm mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mb-2">No requests yet</CardTitle>
              <CardDescription className="max-w-sm mb-6">
                Create your first Request for Proposal to start managing your
                procurement process.
              </CardDescription>
              <Button asChild>
                <Link href="/rfps/new">Create RFP</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <RFPTable rfps={rfps} />
          </div>
        )}
      </div>
    </div>
  );
}
