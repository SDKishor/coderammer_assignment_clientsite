// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowUpDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import { FloatingLogoutWithConfirm } from "@/components/modules/auth/LogoutButton";
import { toast } from "sonner";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  user: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface JwtPayload {
  role: string;
  name?: string;
  id: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // Authentication and data fetching
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (decoded.role !== "admin") {
        router.push("/dashboard/user");
        return;
      }

      setAdminName(decoded.name || "Admin");

      // Fetch transactions from API - Mock data
      const fetchTransactions = async () => {
        const response = await fetch("http://localhost:5000/api/transaction/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data.data);
      };

      fetchTransactions();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Sorting functionality
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig) return 0;

    const key = sortConfig.key;
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof Transaction) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle transaction status update
  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!selectedTransaction) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        router.push("/login");
        return;
      }

      const endpoint = status === "approved" ? "approve" : "reject";
      const response = await fetch(
        `http://localhost:5000/api/transaction/${endpoint}/${selectedTransaction}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update transaction status"
        );
      }

      // Update local state with new status
      setTransactions((prev) =>
        prev.map((tx) =>
          tx._id === selectedTransaction ? { ...tx, status } : tx
        )
      );

      toast.success(`Transaction ${status} successfully!`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Error updating transaction status");
      } else {
        toast.error("An unknown error occurred");
      }
      // ...
    } finally {
      setSelectedTransaction(null);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
    const statusConfig = {
      approved: { color: "green", icon: <CheckCircle2 className="h-4 w-4" /> },
      pending: { color: "yellow", icon: <Clock className="h-4 w-4" /> },
      rejected: { color: "red", icon: <XCircle className="h-4 w-4" /> },
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit
          bg-${statusConfig[status].color}-100 text-${statusConfig[status].color}-800`}
      >
        {statusConfig[status].icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <FloatingLogoutWithConfirm />
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {adminName}
        </h1>
        <p className="text-gray-600 mt-2">Transaction Management Dashboard</p>
      </header>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: "createdAt", label: "Date" },
                { key: "user", label: "User" },
                { key: "description", label: "Description" },
                { key: "amount", label: "Amount" },
                { key: "status", label: "Status" },
                { label: "Actions" },
              ].map((header) => (
                <TableHead key={header.key || header.label}>
                  {header.key ? (
                    <button
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() =>
                        requestSort(header.key as keyof Transaction)
                      }
                    >
                      {header.label}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : (
                    header.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell
                  className={
                    transaction.status === "approved"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  ${Math.abs(transaction.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell>
                  {transaction.status === "pending" && (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() =>
                              setSelectedTransaction(transaction._id)
                            }
                          >
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Approval
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve this transaction?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate("approved")}
                            >
                              Confirm Approval
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              setSelectedTransaction(transaction._id)
                            }
                          >
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Rejection
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject this transaction?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleStatusUpdate("rejected")}
                            >
                              Confirm Rejection
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
