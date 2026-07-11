"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Code2, LayoutDashboard, Users, BookOpen, Settings, LogOut, Shield,
  GraduationCap, UserCog, UserCheck, Key, FileVideo, Files, FileText,
  CheckSquare, Award, Calendar, MessageSquare, Megaphone, Bell, Mail,
  BarChart, Activity, Database, Server, Folder, Globe, Search, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

const sidebarStructure = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "People",
    icon: Users,
    items: [
      { name: "Students", href: "/admin/students", icon: GraduationCap },
      { name: "Mentors", href: "/admin/mentors", icon: UserCheck },
      { name: "Admins", href: "/admin/users", icon: UserCog },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Key },
    ]
  },
  {
    title: "Curriculum",
    icon: BookOpen,
    items: [
      { name: "Internships", href: "/admin/internships", icon: BookOpen },
    ]
  },
  {
    title: "Library",
    icon: FileVideo,
    items: [
      { name: "Video Library", href: "/admin/videos", icon: FileVideo },
      { name: "Audio Library", href: "/admin/audio", icon: FileText },
      { name: "Documents", href: "/admin/documents", icon: Files },
      { name: "Media Manager", href: "/admin/media", icon: Database },
    ]
  },
  {
    title: "Evaluation",
    items: [
      { name: "Evaluation Center", href: "/admin/evaluation", icon: CheckSquare },
    ]
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      { name: "Discussions", href: "/admin/discussions", icon: MessageSquare },
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Messages", href: "/admin/messages", icon: Mail },
    ]
  },
  {
    title: "CMS & Platform",
    icon: Globe,
    items: [
      { name: "Landing Page", href: "/admin/cms/landing", icon: Globe },
      { name: "Categories", href: "/admin/cms/categories", icon: Folder },
      { name: "Reviews", href: "/admin/cms/reviews", icon: MessageSquare },
      { name: "Email Templates", href: "/admin/cms/emails", icon: Mail },
    ]
  },
  {
    title: "Data & Reports",
    icon: BarChart,
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart },
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Audit Logs", href: "/admin/audit", icon: Server },
    ]
  },
  {
    title: "System",
    icon: Settings,
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Backup", href: "/admin/backup", icon: Database },
      { name: "API Keys", href: "/admin/api-keys", icon: Key },
      { name: "System Logs", href: "/admin/logs", icon: Server },
    ]
  }
];

function SidebarGroup({ group, pathname }: { group: any, pathname: string }) {
  // Check if any child is active
  const isActive = group.items.some((item: any) =>
    item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
  );

  // Default open if active, otherwise start closed (except Overview)
  const [isOpen, setIsOpen] = useState(isActive || group.title === "Overview");

  return (
    <div className="mb-4">
      {group.title !== "Overview" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            {group.icon && <group.icon className="w-4 h-4" />}
            {group.title}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      ) : (
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.title}
        </div>
      )}

      {isOpen && (
        <div className="mt-1 space-y-1">
          {group.items.map((link: any) => {
            const isLinkActive = link.href === '/admin' ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${isLinkActive
                  ? "bg-primary text-primary-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ profile }: { profile: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border bg-card flex-shrink-0 flex flex-col max-h-screen">
      <div className="h-20 flex items-center px-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1 group">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="Quantim Labs Logo" 
              width={120} 
              height={32} 
              className="relative object-contain h-8 w-auto z-10 transition-transform duration-500 group-hover:scale-105" 
              style={{ filter: "brightness(0)" }}
              priority 
            />
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-2 transform rotate-12" />
          
          <div className="flex flex-col">
            <span className="text-lg font-heading font-black tracking-tighter text-slate-900 leading-none">
              QUANTIM<span className="text-blue-600">LABS</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-3 h-8 text-xs justify-start text-muted-foreground bg-background">
          <Search className="w-3 h-3 mr-2" />
          Search (Cmd+K)
        </Button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar">
        {sidebarStructure.map((group) => (
          <SidebarGroup key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0 bg-muted/10">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
