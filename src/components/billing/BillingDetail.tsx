import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Receipt, CreditCard, Calendar, User, Building } from "lucide-react";
import { Bill, Staff } from "./data";

interface BillingDetailProps {
  bill: Bill;
  staff: Staff;
  onBack: () => void;
}

export function BillingDetail({ bill, staff, onBack }: BillingDetailProps) {

  // Map status to variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  // Map status to display text
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-white">{bill.type} Bill</h2>
        <Badge variant={getStatusVariant(bill.status)} className="text-sm">
          {getStatusText(bill.status)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Bill Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Amount</p>
                  <p className="text-white font-medium">${bill.amount}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Receipt className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Type</p>
                  <p className="text-white font-medium">{bill.type}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Due Date</p>
                  <p className="text-white font-medium">{bill.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Payment Status</p>
                  <Badge variant={getStatusVariant(bill.status)} className="mt-1">
                    {getStatusText(bill.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Staff Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Name</p>
                  <p className="text-white font-medium">{staff.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-white/60 mr-3" />
                <div>
                  <p className="text-white/60 text-sm">Department</p>
                  <p className="text-white font-medium">{staff.department}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button variant="default">Mark as Paid</Button>
        <Button variant="outline">Edit Bill</Button>
      </div>
    </div>
  );
}
