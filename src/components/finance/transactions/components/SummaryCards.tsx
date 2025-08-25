import { Card, CardContent } from "@/components/ui/card";
import { FileText, Package2, DollarSign } from "lucide-react";
import { SummaryMetrics } from "../types";

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
              <h3 className="text-2xl font-bold">{metrics.totalInvoiceCount.toLocaleString()}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              <Package2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
              <h3 className="text-2xl font-bold">{metrics.totalQuantity.toLocaleString()}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Line Amount</p>
              <h3 className="text-2xl font-bold">
                ${metrics.totalLineAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
