"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Pill, Scissors, Utensils, Gift, Star } from "lucide-react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { getCurrentUser } from "@/lib/auth";

// Hardcoded categories for the marketplace
const categories = [
  {
    id: "medications",
    name: "Medications",
    description: "Prescription and over-the-counter medications for pets",
    icon: <Pill className="h-8 w-8 text-teal-600" />,
    image: "/pet-medications.png",
  },
  {
    id: "food",
    name: "Food & Nutrition",
    description: "Premium pet food, supplements, and treats",
    icon: <Utensils className="h-8 w-8 text-teal-600" />,
    image: "/pet-food-variety.png",
  },
  {
    id: "grooming",
    name: "Grooming Supplies",
    description: "Shampoos, brushes, and grooming tools",
    icon: <Scissors className="h-8 w-8 text-teal-600" />,
    image: "/pet-grooming.png",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Collars, leashes, beds, and toys",
    icon: <PawPrint className="h-8 w-8 text-teal-600" />,
    image: "/pet-accessories.png",
  },
  {
    id: "gifts",
    name: "Pet Gifts",
    description: "Special items for your beloved pets",
    icon: <Gift className="h-8 w-8 text-teal-600" />,
    image: "/pet-gifts.png",
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        setError(null);

        // Get current user
        const user = await getCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
        }

        // Fetch featured products with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch("/api/store/products?featured=true", {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (isMounted) {
            setProducts(data.products || []);
          }
        } catch (fetchError) {
          if (fetchError.name === "AbortError") {
            throw new Error("Request timeout - please try again");
          }
          throw fetchError;
        }
      } catch (err) {
        console.error("Error fetching marketplace data:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load products. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(!!query);

    if (query) {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/store/products?search=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          throw new Error("Failed to search products");
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error searching products:", err);
        setError("Failed to search products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          item: {
            id: productId,
            quantity: 1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      // Show success message or update UI
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  return (
    <div>
      <MarketplaceHeader
        title="Pet Marketplace"
        description="Browse our selection of premium pet products and supplies"
        onSearch={handleSearch}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : isSearching ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Search Results for "{searchQuery}"
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <Link
                  href={`/dashboard/marketplace/product/${product.product_id}`}
                  key={product.product_id}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          product.image_url ||
                          "/placeholder.svg?height=200&width=300&query=pet%20product"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 mb-2">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating || 4)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {product.rating || 4.0}
                        </span>
                      </div>
                      <div className="text-xl font-bold">
                        ${Number.parseFloat(product.price).toFixed(2)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product.product_id);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No products found matching "{searchQuery}"
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsSearching(false)}
              >
                View All Categories
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              href={`/dashboard/marketplace/category/${category.id}`}
              key={category.id}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{category.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Browse Products
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 bg-teal-50 dark:bg-teal-900/30 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-foreground">
              Need Veterinary Supplies?
            </h2>
            <p className="text-muted-foreground mt-2">
              We offer special discounts for veterinary clinics and
              professionals.
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700">
            Contact for Wholesale
          </Button>
        </div>
      </div>
    </div>
  );
}
