import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quote } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface QuoteCardProps {
  quote: Quote | null;
  onCreateQuote: () => Promise<void>;
}

export const QuoteCard = ({ quote, onCreateQuote }: QuoteCardProps) => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      setCreating(true);
      await onCreateQuote();
      toast({
        title: "Quote created",
        description: "A draft quote has been prepared for this project.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to create quote",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!quote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote</CardTitle>
          <CardDescription>Generate a draft quote from the current task estimates.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-between">
          <span className="text-sm text-muted-foreground">A 10% tax rate is applied automatically.</span>
          <Button onClick={handleCreate} disabled={creating}>
            Create quote
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Quote summary</CardTitle>
          <CardDescription>Tax rate: 10%</CardDescription>
        </div>
        <Badge variant={quote.status === "approved" ? "default" : "secondary"} className="uppercase">
          {quote.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-medium">{currency.format(quote.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tax</span>
          <span className="font-medium">{currency.format(quote.tax)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold">{currency.format(quote.total)}</span>
        </div>
      </CardContent>
      {quote.status !== "approved" && (
        <CardFooter className="justify-between">
          <span className="text-sm text-muted-foreground">Share this draft with the customer for approval.</span>
          <Button variant="outline" onClick={handleCreate} disabled={creating}>
            Regenerate quote
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
