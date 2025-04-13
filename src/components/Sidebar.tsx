"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuHistory, LuUser, LuClipboard, LuDollarSign, LuMenu, LuX, LuCircleHelp } from "react-icons/lu";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileView, setIsMobileView] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we're on client-side before using window
    if (typeof window !== "undefined") {
      const checkScreenSize = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      // Initial check
      checkScreenSize();
      
      // Add event listener for window resize
      window.addEventListener("resize", checkScreenSize);
      
      // Cleanup
      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  const sidebarItems = [
    {
      icon: LuLayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: LuDollarSign,
      label: "Place Bet",
      href: "/place-bet",
    },
    {
      icon: LuClipboard, 
      label: "Current Bets",
      href: "/current-bets",
    },
    {
      icon: LuUser,
      label: "Account Details",
      href: "/account-details",
    },
    {
      icon: LuHistory,
      label: "Bet History",
      href: "/bet-history"
    },{
      icon: LuCircleHelp,
      label: "How to Use",
      href: "/how-to-use"
    }
  ];

  const renderNavLinks = () => (
    <nav className="space-y-2">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  // For mobile view, render a slide-out drawer
  if (isMobileView) {
    return (
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Stake Manager</h2>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <LuMenu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:max-w-sm">
              <div className="px-2 py-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">S</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Stake Manager</h2>
                </div>
                {renderNavLinks()}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // For desktop view, render the sidebar
  return (
    <div className="hidden md:flex w-64 h-screen bg-background border-r flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Stake Manager</h2>
        </div>
      </div>
      
      <div className="flex-1 px-4 mt-4">
        {renderNavLinks()}
      </div>
    </div>
  );
}
