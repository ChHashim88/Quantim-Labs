"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { login, signup } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const response = isLogin ? await login(formData) : await signup(formData);
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.success) {
        toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
        router.push(response.redirect);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left side: Brand/Visuals (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        {/* Creative Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/login.png" 
            alt="Login Background" 
            fill
            className="object-cover animate-pulse-slow"
            style={{ animationDuration: '15s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDirection: 'alternate' }}
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="inline-flex items-center gap-1 group mb-16 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Quantim Labz Logo" 
              width={160} 
              height={44} 
              className="relative object-contain h-10 w-auto z-10 filter brightness-0 invert" 
              priority 
            />
            <div className="h-6 w-px bg-white/20 mx-3 transform rotate-12" />
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-tighter text-white leading-none">
                QUANTIM<span className="text-blue-400">LABS</span>
              </span>
            </div>
          </Link>


          <h1 className="text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Accelerate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Tech Career.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-12 max-w-md">
            Join the elite community of developers mastering real-world skills through immersive, intensive programs.
          </p>

          <div className="flex items-center gap-8 border-t border-white/10 pt-8 mt-12">
             <div className="flex flex-col">
               <span className="text-4xl font-black text-white">58+</span>
               <span className="text-sm font-medium text-slate-400 mt-1">World-Class Mentors</span>
             </div>
             <div className="h-12 w-px bg-white/10" />
             <div className="flex flex-col">
               <span className="text-4xl font-black text-white">100%</span>
               <span className="text-sm font-medium text-slate-400 mt-1">Practical Execution</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 relative bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center gap-1 group">
           <Image src="/logo.png" alt="Logo" width={120} height={32} className="h-8 w-auto object-contain" style={{ filter: "brightness(0)" }} priority />
           <div className="h-5 w-px bg-slate-200 mx-2 transform rotate-12" />
           <span className="text-lg font-heading font-black tracking-tighter text-slate-900 leading-none">
             QUANTIM<span className="text-blue-600">LABS</span>
           </span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-auto mt-16 lg:mt-0"
        >
          {/* Form Header */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-slate-500 text-base">
              {isLogin ? "Enter your credentials to access your workspace." : "Start your journey by filling out the details below."}
            </p>
          </div>

          <form id="auth-form" onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-slate-700 font-medium">First Name</Label>
                  <Input 
                    id="first_name" 
                    name="first_name" 
                    required 
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-blue-500 rounded-xl transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-slate-700 font-medium">Last Name</Label>
                  <Input 
                    id="last_name" 
                    name="last_name" 
                    required 
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-blue-500 rounded-xl transition-all" 
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-blue-500 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-blue-500 rounded-xl transition-all"
              />
            </div>

            <Button
              form="auth-form"
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-base font-semibold shadow-lg shadow-slate-900/10 transition-all"
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
