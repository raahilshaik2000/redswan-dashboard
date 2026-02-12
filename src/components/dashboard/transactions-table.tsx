"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { recentTransactions } from "@/lib/data";

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  failed: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function TransactionsTable() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest activity across all accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                <TableCell>{txn.customer}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusStyles[txn.status]}>
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                <TableCell className="text-right font-medium">
                  ${txn.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
