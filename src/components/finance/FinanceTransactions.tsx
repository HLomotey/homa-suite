import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function FinanceTransactions() {
  const transactions = [
    {
      id: "TR-2023-001",
      date: "2023-07-20",
      description: "Client Payment - Acme Inc.",
      amount: 24500,
      type: "income",
      status: "completed"
    },
    {
      id: "TR-2023-002",
      date: "2023-07-18",
      description: "Office Supplies",
      amount: 1250,
      type: "expense",
      status: "completed"
    },
    {
      id: "TR-2023-003",
      date: "2023-07-15",
      description: "Client Payment - Globex",
      amount: 18750,
      type: "income",
      status: "completed"
    },
    {
      id: "TR-2023-004",
      date: "2023-07-12",
      description: "Software Subscription",
      amount: 3500,
      type: "expense",
      status: "completed"
    },
    {
      id: "TR-2023-005",
      date: "2023-07-10",
      description: "Client Payment - Initech",
      amount: 15000,
      type: "income",
      status: "pending"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Financial Transactions</h2>
      <p className="text-sm text-muted-foreground">Recent financial transactions and payments</p>
      
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>View and manage recent financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    ${transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "outline" : "secondary"}>
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === "completed" ? "default" : "outline"}>
                      {transaction.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
