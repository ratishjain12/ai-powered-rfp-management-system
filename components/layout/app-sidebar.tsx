"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Home,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rfps", label: "Requests", icon: FileText },
  { href: "/vendors", label: "Vendors", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex-col bg-card border-r hidden md:flex w-64 shadow-sm z-10 relative">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg tracking-tight text-foreground">
            RFP Manager
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4">
        <div className="mb-6">
          <Button
            asChild
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
            size="lg"
          >
            <Link href="/rfps/new">
              <PlusCircle className="h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        <nav className="grid items-start gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                john@example.com
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md ml-auto hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
