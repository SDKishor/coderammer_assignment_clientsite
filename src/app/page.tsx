// app/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-slate-800">
              SecureFlow
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900">
            Transaction Security
            <br />
            <span className="text-primary">Simplified</span>
          </h1>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="text-lg bg-primary hover:bg-primary/90 py-7 cursor-pointer"
            >
              <Link href="/register">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 text-lg border-primary text-primary hover:bg-purple-700/10 py-7 cursor-pointer"
            >
              <Link href="/login">Existing User? Sign In</Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Lock className="w-4 h-4" />
            256-bit encrypted transaction system
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
