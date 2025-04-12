"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuBed, LuHistory, LuUser } from "react-icons/lu";

export function Sidebar() {
  const pathname = usePathname();

  const sidebarItems = [
    {
      icon: LuLayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: LuBed,
      label: "Place Bet",
      href: "/place-bet",
    },
    {
      icon: LuHistory, 
      label: "Current Bets",
      href: "/current-bets",
    },
    {
      icon: LuUser,
      label: "Account Details",
      href: "/account-details",
    },
  ];

  return (
    <div className="w-64 h-screen bg-background border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Stake Manager</h2>
        </div>
      </div>
      
      <div className="flex-1 px-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
