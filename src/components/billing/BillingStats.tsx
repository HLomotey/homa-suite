import { Bill } from "./data";
import { FileText, CreditCard, DollarSign, Users } from "lucide-react";

interface BillingStatsProps {
  bills: Bill[];
}

export function BillingStats({ bills }: BillingStatsProps) {
  // Calculate stats
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const overdueBills = bills.filter(b => b.status === 'overdue').length;
  
  const stats = [
    { 
      label: 'Total Bills', 
      value: totalBills, 
      icon: FileText, 
      bgClass: 'bg-black/40'
    },
    { 
      label: 'Paid', 
      value: paidBills, 
      icon: CreditCard, 
      bgClass: 'bg-black/40'
    },
    { 
      label: 'Pending', 
      value: pendingBills, 
      icon: DollarSign, 
      bgClass: 'bg-black/40'
    },
    { 
      label: 'Overdue', 
      value: overdueBills, 
      icon: Users, 
      bgClass: 'bg-black/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {/* Total Bills */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Total Bills</p>
            <p className="text-white text-3xl font-bold">{totalBills}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <FileText className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>
      
      {/* Paid */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Paid</p>
            <p className="text-white text-3xl font-bold">{paidBills}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <CreditCard className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>
      
      {/* Pending */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Pending</p>
            <p className="text-white text-3xl font-bold">{pendingBills}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <DollarSign className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>
      
      {/* Overdue */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Overdue</p>
            <p className="text-white text-3xl font-bold">{overdueBills}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <Users className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
