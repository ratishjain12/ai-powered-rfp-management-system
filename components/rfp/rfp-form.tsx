"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

const rfpInputSchema = z.object({
  naturalLanguage: z
    .string()
    .min(10, "Please provide at least 10 characters of description")
    .max(5000, "Description is too long"),
});

type RFPInputFormValues = z.infer<typeof rfpInputSchema>;

interface RFPFormProps {
  onSubmit: (data: { naturalLanguage: string }) => Promise<void>;
  isLoading?: boolean;
}

export function RFPForm({ onSubmit, isLoading = false }: RFPFormProps) {
  const form = useForm<RFPInputFormValues>({
    resolver: zodResolver(rfpInputSchema),
    defaultValues: {
      naturalLanguage: "",
    },
  });

  const handleSubmit = async (values: RFPInputFormValues) => {
    await onSubmit(values);
    // Don't reset immediately to prevent UI jump before redirect
  };

  return (
    <div className="grid gap-6">
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>AI RFP Assistant</CardTitle>
              <CardDescription>
                Describe what you need, and we&apos;ll generate a structured RFP
                for you.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="naturalLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Procurement Requirements
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I need 50 high-performance laptops for our engineering team. Budget is around $100k. Required specs: 32GB RAM, 1TB SSD, i7/M3 chips. Need delivery by next month. Payment terms Net 30."
                        className="min-h-[250px] resize-y text-base p-4 leading-relaxed"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about quantities, budget, timeline, and
                      technical specs for better results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full sm:w-auto min-w-[150px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating RFP...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate RFP
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Define Needs",
            desc: "Describe items, quantities, and specs naturally.",
          },
          {
            title: "Set Constraints",
            desc: "Include budget, timeline, and payment terms.",
          },
          {
            title: "Review & Send",
            desc: "Edit the generated RFP before sending to vendors.",
          },
        ].map((step, i) => (
          <Card key={i} className="bg-muted/50 border-none shadow-none">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-8 h-8 rounded-full bg-background border flex items-center justify-center text-sm font-bold mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
