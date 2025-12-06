"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RFPActionMenuProps {
  rfpId: string;
}

export function RFPActionMenu({ rfpId }: RFPActionMenuProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this RFP? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/rfps/${rfpId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete RFP");
      }

      router.push("/rfps");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/rfps/${rfpId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit RFP
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete RFP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <div className="fixed bottom-4 right-4 z-50 w-96">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
