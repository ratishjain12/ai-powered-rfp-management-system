"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RFPForm } from "@/components/rfp/rfp-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewRFPPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { naturalLanguage: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/rfps/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create RFP");
      }

      const rfp = await response.json();
      router.push(`/rfps/${rfp.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rfps">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New RFP</h1>
          <p className="text-muted-foreground">
            Use AI to draft a comprehensive Request for Proposal in seconds.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RFPForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
