"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PawPrint,
  Users,
  Calendar,
  Warehouse,
  ShoppingBag,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Home,
  Package,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "@/components/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

function NavItem({ href, icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive
          ? "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-50"
          : "text-gray-500 hover:text-teal-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-50 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.id || "user-1",
            name: user.name || "User",
            email: user.email || "user@example.com",
            role: user.role || "CUSTOMER",
            avatar: "/abstract-geometric-shapes.png",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Define navigation items with role-based access
  const navigationItems = [
    // Add Home Page as the first item
    {
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      title: "Home Page",
      roles: [
        "CUSTOMER",
        "VETERINARIAN",
        "SECRETARY",
        "PETGROOMER",
        "ADMINISTRATOR",
        "ADMIN",
      ],
    },
    {
      href: "/dashboard/pets",
      icon: <PawPrint className="h-5 w-5" />,
      title: "Pet Management",
      roles: [
        "CUSTOMER",
        "VETERINARIAN",
        "SECRETARY",
        "ADMINISTRATOR",
        "ADMIN",
      ],
    },
    {
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
      title: "Customer Management",
      roles: ["VETERINARIAN", "SECRETARY", "ADMINISTRATOR", "ADMIN"],
    },
    {
      href: "/dashboard/appointments",
      icon: <Calendar className="h-5 w-5" />,
      title: "Appointments",
      roles: [
        "CUSTOMER",
        "VETERINARIAN",
        "SECRETARY",
        "PETGROOMER",
        "ADMINISTRATOR",
        "ADMIN",
      ],
    },
    {
      href: "/dashboard/warehouse",
      icon: <Warehouse className="h-5 w-5" />,
      title: "Warehouse",
      roles: [
        "PETGROOMER",
        "VETERINARIAN",
        "SECRETARY",
        "ADMINISTRATOR",
        "ADMIN",
      ],
    },
    {
      href: "/dashboard/marketplace",
      icon: <ShoppingBag className="h-5 w-5" />,
      title: "Marketplace",
      roles: [
        "CUSTOMER",
        "VETERINARIAN",
        "SECRETARY",
        "ADMINISTRATOR",
        "ADMIN",
      ],
    },
    {
      href: "/dashboard/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Reports & Analytics",
      roles: ["VETERINARIAN", "SECRETARY", "ADMINISTRATOR", "ADMIN"],
    },
  ];

  // Filter navigation items based on user role
  const navigation = navigationItems.filter((item) => {
    if (!currentUser) return false;

    // Always show all items to administrators
    if (isAdmin(currentUser.role)) {
      return true;
    }

    // Otherwise, filter based on roles
    return item.roles.includes(currentUser.role.toUpperCase());
  });

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/dashboard") {
      e.preventDefault();
    }
  };

  const handleSignOut = async () => {
    try {
      // Make a POST request to the logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // If logout was successful, redirect to the home page
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard"
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <Image
              src="/Pet-a-vet-logo-transparent.png"
              alt="Pet-à-Vet Logo"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-xl font-bold text-teal-600 dark:text-teal-500">
              Pet-à-Vet
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4">
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 dark:bg-gray-950">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/dashboard"
                      onClick={handleLogoClick}
                      className="flex items-center gap-2"
                    >
                      <Image
                        src="/Pet-a-vet-logo-transparent.png"
                        alt="Pet-à-Vet Logo"
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                      <span className="text-xl font-bold text-teal-600 dark:text-teal-500">
                        Pet-à-Vet
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navigation.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      isActive={pathname === item.href}
                    />
                  ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:text-red-400 dark:hover:bg-red-950"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center ml-auto space-x-2">
            <ThemeToggle />
            <NotificationsPopover />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full ml-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={currentUser?.avatar || "/placeholder.svg"}
                      alt={currentUser?.name}
                    />
                    <AvatarFallback>
                      {currentUser?.name?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {currentUser?.role?.toLowerCase() === "customer" && (
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/orders")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    router.push("/dashboard/profile?tab=subscription")
                  }
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
