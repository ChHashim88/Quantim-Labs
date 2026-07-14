"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user: any;
  userRole: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F2F2F2]/90 backdrop-blur-md border-b border-[#DCDCDC]">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <Image
              src="/logo.png"
              alt="Quantim Labz Logo"
              width={64}
              height={64}
              className="object-contain h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
              style={{ filter: "brightness(0)" }}
              priority
            />
            <span className="hidden sm:block text-xl md:text-xl font-extrabold tracking-tighter text-[#111] uppercase font-heading -ml-3">
              Uantim Labz
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-[#555] hover:text-[#111] transition-colors">
              Home
            </Link>
            <Link href="/services" className="text-sm text-[#555] hover:text-[#111] transition-colors">
              Services
            </Link>
            <Link href="/internship-programs" className="text-sm text-[#555] hover:text-[#111] transition-colors">
              Internship Programs
            </Link>
            <Link href="/about" className="text-sm text-[#555] hover:text-[#111] transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-[#555] hover:text-[#111] transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#111]">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#F2F2F2] border-b border-[#DCDCDC] px-8 pt-2 pb-6 space-y-1"
        >
          <Link href="/" className="block px-3 py-2 text-sm text-[#555] hover:text-[#111] rounded-lg hover:bg-[#E8E8E8]">
            Home
          </Link>
          <Link href="/services" className="block px-3 py-2 text-sm text-[#555] hover:text-[#111] rounded-lg hover:bg-[#E8E8E8]">
            Services
          </Link>
          <Link href="/internship-programs" className="block px-3 py-2 text-sm text-[#555] hover:text-[#111] rounded-lg hover:bg-[#E8E8E8]">
            Internship Programs
          </Link>
          <Link href="/about" className="block px-3 py-2 text-sm text-[#555] hover:text-[#111] rounded-lg hover:bg-[#E8E8E8]">
            About Us
          </Link>
          <Link href="/contact" className="block px-3 py-2 text-sm text-[#555] hover:text-[#111] rounded-lg hover:bg-[#E8E8E8]">
            Contact Us
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
