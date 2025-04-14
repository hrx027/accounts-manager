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
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderLogo = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-800 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-lg font-bold text-white">S</span>
      </div>
      <h2 className="text-xl font-bold text-black dark:text-white">Stake Manager</h2>
    </div>
  );

  // For mobile view, render a slide-out drawer
  if (isMobileView) {
    return (
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0F212E] border-b border-gray-200 dark:border-gray-800 py-2 px-4">
        <div className="flex items-center justify-between">
          {renderLogo()}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-800">
                <LuMenu className="h-5 w-5 text-black dark:text-white" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] bg-white dark:bg-[#0F212E] border-r border-gray-200 dark:border-gray-800 z-50">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                {renderLogo()}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="border-gray-200 dark:border-gray-800"
                >
                  <LuX className="h-5 w-5 text-black dark:text-white" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <div className="py-4">{renderNavLinks()}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // For desktop view, render a static sidebar
  return (
    <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:z-30 bg-white dark:bg-[#0F212E] border-r border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex flex-col min-h-0 pt-5">
        <div className="flex items-center justify-center px-4 mb-6">
          {renderLogo()}
        </div>
        <div className="flex-1 flex flex-col px-3">
          {renderNavLinks()}
        </div>
      </div>
    </div>
  );
}
