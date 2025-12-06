"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, MoreHorizontal, Trash, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface RFP {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  budget?: string | null;
  createdAt: Date;
  vendorCount?: number;
}

interface RFPTableProps {
  rfps: RFP[];
}

export function RFPTable({ rfps }: RFPTableProps) {
  const router = useRouter();

  const statusConfig: Record<
    string,
    {
      variant: "default" | "secondary" | "outline" | "destructive";
      label: string;
    }
  > = {
    draft: { variant: "secondary", label: "Draft" },
    sent: { variant: "default", label: "Sent" },
    responded: { variant: "default", label: "Responded" },
    closed: { variant: "outline", label: "Closed" },
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RFP?")) return;

    try {
      const response = await fetch(`/api/rfps/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete RFP", error);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Vendors</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rfps.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No RFPs found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            rfps.map((rfp) => {
              const config = statusConfig[rfp.status] || {
                variant: "secondary",
                label: rfp.status,
              };

              return (
                <TableRow key={rfp.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/rfps/${rfp.id}`}
                        className="hover:underline decoration-primary underline-offset-4"
                      >
                        {rfp.title}
                      </Link>
                      {rfp.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[380px] mt-0.5 font-normal">
                          {rfp.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="capitalize">
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rfp.budget || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rfp.vendorCount || 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(rfp.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-primary"
                      >
                        <Link href={`/rfps/${rfp.id}`}>
                          View
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/rfps/${rfp.id}/edit`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(rfp.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
