"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  notes?: string | null;
  createdAt: string | Date;
}

interface VendorTableProps {
  vendors: Vendor[];
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendorId: string) => void;
  isLoading?: boolean;
}

export function VendorTable({
  vendors,
  onEdit,
  onDelete,
  isLoading,
}: VendorTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading vendors...
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No vendors found. Create your first vendor to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell className="font-medium">{vendor.name}</TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>
                {vendor.notes ? (
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {vendor.notes}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(vendor)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(vendor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
