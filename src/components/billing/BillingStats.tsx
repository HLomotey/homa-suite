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
      <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm">Total Bills</p>
            <p className="text-white text-3xl font-bold">{totalBills}</p>
            {totalBills > 0 && <p className="text-green-400 text-xs mt-1">+{Math.round(totalBills * 0.1)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-blue-900/50 rounded-full">
            <FileText className="h-5 w-5 text-blue-300" />
          </div>
        </div>
      </div>
      
      {/* Paid */}
      <div className="bg-green-950 border border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-300 text-sm">Paid</p>
            <p className="text-white text-3xl font-bold">{paidBills}</p>
            {paidBills > 0 && <p className="text-green-400 text-xs mt-1">+{Math.round(paidBills * 0.15)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-green-900/50 rounded-full">
            <CreditCard className="h-5 w-5 text-green-300" />
          </div>
        </div>
      </div>
      
      {/* Pending */}
      <div className="bg-amber-950 border border-amber-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-300 text-sm">Pending</p>
            <p className="text-white text-3xl font-bold">{pendingBills}</p>
            {pendingBills > 0 && <p className="text-red-400 text-xs mt-1">-{Math.round(pendingBills * 0.1)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-amber-900/50 rounded-full">
            <DollarSign className="h-5 w-5 text-amber-300" />
          </div>
        </div>
      </div>
      
      {/* Overdue */}
      <div className="bg-purple-950 border border-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-sm">Overdue</p>
            <p className="text-white text-3xl font-bold">{overdueBills}</p>
            {overdueBills > 0 && <p className="text-red-400 text-xs mt-1">-{Math.round(overdueBills * 0.1)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-purple-900/50 rounded-full">
            <Users className="h-5 w-5 text-purple-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
