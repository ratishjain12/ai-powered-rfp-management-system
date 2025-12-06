"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface VendorSelectorProps {
  vendors: Vendor[];
  selectedVendorIds: string[];
  onSelectionChange: (vendorIds: string[]) => void;
  isLoading?: boolean;
}

export function VendorSelector({
  vendors,
  selectedVendorIds,
  onSelectionChange,
  isLoading = false,
}: VendorSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      onSelectionChange(selectedVendorIds.filter((id) => id !== vendorId));
    } else {
      onSelectionChange([...selectedVendorIds, vendorId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isLoading || vendors.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            `Select Vendors (${selectedVendorIds.length} selected)`
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Vendors</DialogTitle>
          <DialogDescription>
            Choose one or more vendors to send this RFP to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {vendors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No vendors available. Create vendors first.
            </p>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center space-x-2">
                <Checkbox
                  id={vendor.id}
                  checked={selectedVendorIds.includes(vendor.id)}
                  onCheckedChange={() => handleToggle(vendor.id)}
                />
                <Label
                  htmlFor={vendor.id}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  <div className="font-medium">{vendor.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {vendor.email}
                  </div>
                </Label>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
