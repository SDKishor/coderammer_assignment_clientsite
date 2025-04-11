import { RegistrationForm } from "@/components/modules/auth/RegisterForm";
import Link from "next/link";

const registerPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border border-primary/30  w-lg">
        <h1 className="text-2xl font-bold mb-4">Let&apos;s Get Started</h1>
        <RegistrationForm />

        {/* link to login */}
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <span className="text-blue-500 hover:underline">
            <Link href="/login">Login</Link>
          </span>
        </p>
      </div>
    </div>
  );
};

export default registerPage;
