import { Navbar } from "@/components/layout/navbar";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign in to your account</h1>
            <p className="mt-2 text-slate-600">
              Welcome back! Please enter your details.
            </p>
          </div>
          
          <SignInForm />
          
        </div>
      </div>
    </div>
  );
} 