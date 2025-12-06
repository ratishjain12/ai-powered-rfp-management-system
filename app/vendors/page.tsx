"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VendorTable } from "@/components/vendor/vendor-table";
import { VendorForm } from "@/components/vendor/vendor-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Vendor {
  id: string;
  name: string;
  email: string;
  notes?: string | null;
  createdAt: string | Date;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vendors");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    notes?: string;
  }) => {
    try {
      setError(null);
      const url = editingVendor
        ? `/api/vendors/${editingVendor.id}`
        : "/api/vendors";
      const method = editingVendor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save vendor");
      }

      setIsDialogOpen(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleDelete = async (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete vendor");

      fetchVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vendor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground mt-2">Manage your vendor list</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VendorTable
        vendors={vendors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingVendor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
            <DialogDescription>
              {editingVendor
                ? "Update vendor information"
                : "Add a new vendor to your vendor list"}
            </DialogDescription>
          </DialogHeader>
          <VendorForm
            onSubmit={handleSubmit}
            defaultValues={
              editingVendor
                ? {
                    ...editingVendor,
                    notes: editingVendor.notes || undefined,
                  }
                : undefined
            }
            submitLabel={editingVendor ? "Update Vendor" : "Create Vendor"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
