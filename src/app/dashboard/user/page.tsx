"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { FloatingLogoutWithConfirm } from "@/components/modules/auth/LogoutButton";
import { toast } from "sonner";

const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Minimum amount is $0.01"),
  description: z.string().optional(),
});

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

export default function UserDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userCredit, setUserCredit] = useState(0);
  const [userName, setUserName] = useState("User");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (decoded.role !== "user") {
        router.push("/login");
      }

      setUserName(decoded.name || "User");

      // Fetch transactions from API - Mock data
      const fetchTransactions = async () => {
        const response = await fetch(
          `http://localhost:5000/api/transaction/${decoded.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data.data);
      };

      const fetchUserCredit = async () => {
        const response = await fetch(
          `http://localhost:5000/api/auth/credit/${decoded.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserCredit(data.data);
      };

      fetchTransactions();
      fetchUserCredit();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded: JwtPayload = jwtDecode(token);

      const response = await fetch(
        "http://localhost:5000/api/transaction/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: decoded.id,
            amount: Number(values.amount),
            description: values.description || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newTransaction = await response.json();

      console.log(newTransaction);
      setTransactions((prev) => [newTransaction.data, ...prev]);
      toast.success("Transaction submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Failed to submit transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <FloatingLogoutWithConfirm />
      {/* Header Section */}
      <header className="bg-gradient-to-r from-primary/80 to-primary text-white p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
            <p className="text-gray-200">Start managing your transactions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Available Credit</p>
            <p className="text-3xl font-bold">${userCredit.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">New Transaction Request</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex  gap-4 ">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      className="py-6 w-full"
                      placeholder="Amount"
                      step="0.01"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      className="py-6"
                      placeholder="Description"
                      {...field}
                      value={field.value || ""}
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="py-6 px-8 text-lg cursor-pointer">
              Submit Request
            </Button>
          </form>
        </Form>

        {form.formState.errors.amount && (
          <p className="text-red-500 mt-2">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.createdAt}</TableCell>
                <TableCell
                  className={
                    transaction.status === "approved"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  ${Math.abs(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      transaction.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
