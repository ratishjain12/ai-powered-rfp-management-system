"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIRecommendationProps {
  rfpId: string;
}

interface Recommendation {
  recommendedVendor: string;
  reasoning: string;
  summary: {
    vendorName: string;
    strengths: string[];
    concerns: string[] | null;
  };
}

export function AIRecommendation({ rfpId }: AIRecommendationProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/rfps/${rfpId}/recommend`);
      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        throw new Error("Failed to fetch recommendation");
      }
      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [rfpId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Generating recommendation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!recommendation) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle>AI Recommendation</CardTitle>
        </div>
        <CardDescription>Our AI analysis of the proposals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Recommended Vendor:</span>
            <Badge variant="default">{recommendation.recommendedVendor}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
        </div>
        {recommendation.summary && (
          <div className="space-y-2">
            {recommendation.summary.strengths.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-1">Strengths:</div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {recommendation.summary.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.summary.concerns && recommendation.summary.concerns.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-1">Concerns:</div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {recommendation.summary.concerns.map((concern, idx) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

