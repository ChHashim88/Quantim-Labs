"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user: any;
  userRole: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80  border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-1 group cursor-pointer transition-all">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/logo.png"
                alt="Quantim Labs Logo"
                width={160}
                height={44}
                className="relative object-contain h-11 w-auto z-10 transition-transform duration-500 group-hover:scale-105"
                style={{ filter: "brightness(0)" }}
                priority
              />
            </div>
            
            <div className="hidden sm:block h-7 w-px bg-slate-200 mx-3 transform rotate-12" />
            
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-heading font-black tracking-tighter text-slate-900 leading-none">
                QUANTIM<span className="text-blue-600">LABS</span>
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Programs
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="/mentors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Mentors
            </Link>

            {user ? (
              <Link href={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/student'}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-6 shadow-md transition-all">
                  {userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'Admin Portal' : 'Student Dashboard'}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full px-6 shadow-[0_0_15px_rgba(68,255,209,0.4)] transition-all">
                  Apply Now
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-b border-border px-4 pt-2 pb-4 space-y-1 shadow-2xl"
        >
          <Link href="/programs" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md">
            Programs
          </Link>
          <Link href="/about" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md">
            About Us
          </Link>
          <Link href="/mentors" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md">
            Mentors
          </Link>
          <Link href="/how-it-works" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md">
            How it Works
          </Link>

          {user ? (
            <Link href={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/student'} className="block px-3 py-2 text-base font-medium text-primary hover:bg-muted rounded-md">
              {userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'Admin Portal' : 'Student Dashboard'}
            </Link>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md">
                Login
              </Link>
              <Button className="w-full mt-4 bg-primary text-primary-foreground font-semibold rounded-full">
                Apply Now
              </Button>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
}
