"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "@/hooks/use-debounce";

interface MarketplaceHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
}

function MarketplaceHeaderBase({
  title,
  description,
  showBackButton = false,
  backUrl = "/dashboard/marketplace",
  onSearch,
  hideSearch = false,
}: MarketplaceHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Create debounced search function
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearch) {
      onSearch(value);
      setIsSearching(false);
    }
  }, 400);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setIsSearching(true);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Fetch cart item count with proper error handling and AbortController
  useEffect(() => {
    console.log("[MarketplaceHeader] Setting up cart polling");

    const controller = new AbortController();

    // Initial fetch
    const fetchCartCount = async () => {
      try {
        const response = await fetch("/api/store/cart", {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status !== 401) {
            // Ignore auth errors (user not logged in)
            console.error("Error fetching cart:", response.status);
          }
          return;
        }

        const data = await response.json();
        // Calculate total items in cart
        const itemCount = data.items
          ? data.items.reduce(
              (total: number, item: any) => total + item.quantity,
              0
            )
          : 0;
        setCartItemCount(itemCount);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching cart count:", error);
        }
      }
    };

    fetchCartCount();

    // Use a reasonable polling interval (5 seconds)
    const interval = setInterval(() => {
      console.log("[MarketplaceHeader] Polling cart data");
      fetchCartCount();
    }, 5000);

    // Cleanup function
    return () => {
      console.log("[MarketplaceHeader] Cleaning up cart polling");
      clearInterval(interval);
      controller.abort();
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {!hideSearch && (
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
                <div className="animate-spin h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        )}
        <Link href="/dashboard/marketplace/cart">
          <Button
            variant="outline"
            size="icon"
            className="relative flex-shrink-0"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
            <span className="sr-only">
              Shopping Cart ({cartItemCount} items)
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const MarketplaceHeader = memo(MarketplaceHeaderBase);
