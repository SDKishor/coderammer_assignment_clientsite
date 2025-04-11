import { LoginForm } from "@/components/modules/auth/LoginForm";
import Link from "next/link";

const loginPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border border-primary/30 w-lg">
        <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>
        <LoginForm />

        {/* Link to registration */}
        <p className="mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span className="text-blue-500 hover:underline">
            <Link href="/register">Register</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default loginPage;
