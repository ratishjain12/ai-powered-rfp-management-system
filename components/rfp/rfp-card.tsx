import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar, DollarSign, Users } from "lucide-react";

interface RFPCardProps {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  budget?: string | null;
  createdAt: Date;
  vendorCount?: number;
}

export function RFPCard({
  id,
  title,
  description,
  status,
  budget,
  createdAt,
  vendorCount = 0,
}: RFPCardProps) {
  const statusConfig: Record<
    string,
    {
      variant: "default" | "secondary" | "outline" | "destructive";
      label: string;
    }
  > = {
    draft: { variant: "secondary", label: "Draft" },
    sent: { variant: "default", label: "Sent" },
    responded: { variant: "default", label: "Responded" }, // Added responded status
    closed: { variant: "outline", label: "Closed" },
  };

  const config = statusConfig[status] || {
    variant: "secondary",
    label: status,
  };

  return (
    <Card className="group flex flex-col h-full overflow-hidden border hover:border-primary/50 hover:shadow-sm transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <Badge variant={config.variant} className="shrink-0 capitalize">
            {config.label}
          </Badge>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {budget && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="truncate">{budget}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="truncate">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
          {vendorCount > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <Users className="h-3.5 w-3.5" />
              <span>
                {vendorCount} vendor{vendorCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-between group-hover:bg-muted/50"
        >
          <Link href={`/rfps/${id}`}>
            View Details
            <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
