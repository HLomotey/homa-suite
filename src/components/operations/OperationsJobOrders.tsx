import { ComplaintsManagement } from "@/components/complaints/ComplaintsManagement";

export function OperationsJobOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Complaints & Issues</h1>
        <p className="text-muted-foreground">
          Manage and track property and vehicle complaints
        </p>
      </div>
      
      <ComplaintsManagement />
    </div>
  );
}
