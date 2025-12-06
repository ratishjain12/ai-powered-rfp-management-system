"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorSelector } from "@/components/vendor/vendor-selector";
import { SendRFPButton } from "@/components/rfp/send-rfp-button";

interface Vendor {
  id: string;
  name: string;
  email: string;
}

interface RFPVendorSelectorProps {
  rfpId: string;
  vendors: Vendor[];
  selectedVendorIds: string[];
}

export function RFPVendorSelector({
  rfpId,
  vendors,
  selectedVendorIds: initialSelectedIds,
}: RFPVendorSelectorProps) {
  const router = useRouter();
  const [selectedVendorIds, setSelectedVendorIds] = useState(initialSelectedIds);

  const handleSelectionChange = async (vendorIds: string[]) => {
    setSelectedVendorIds(vendorIds);
    // TODO: Update RFP vendors via API
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <VendorSelector
        vendors={vendors}
        selectedVendorIds={selectedVendorIds}
        onSelectionChange={handleSelectionChange}
      />
      <SendRFPButton rfpId={rfpId} selectedVendorIds={selectedVendorIds} />
    </div>
  );
}

