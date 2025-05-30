"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft } from "lucide-react";
import { MarketplaceHeader } from "@/components/marketplace-header";
import { Badge } from "@/components/ui/badge";

// Define category names outside component to prevent recreation on render
const categoryNames: Record<string, string> = {
  medications: "Medications",
  food: "Food & Nutrition",
  grooming: "Grooming Supplies",
  accessories: "Accessories",
  gifts: "Pet Gifts",
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    console.log(`[CategoryPage] Fetching products for category: ${categoryId}`);

    // Set category name immediately to prevent UI flicker
    setCategoryName(categoryNames[categoryId] || categoryId);

    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        if (!isInitialLoad) {
          setLoading(true);
        }

        const response = await fetch(
          `/api/store/products?category=${categoryId}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching products:", err);
          setError("Failed to load products. Please try again.");
        }
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchProducts();

    // Cleanup function to abort fetch on component unmount or categoryId change
    return () => {
      controller.abort();
    };
  }, [categoryId, isInitialLoad]); // Removed categoryNames from dependencies since it's now static

  const handleSearch = useCallback(
    async (query: string) => {
      console.log(
        `[CategoryPage] Searching products for: "${query}" in category: ${categoryId}`
      );

      const controller = new AbortController();

      try {
        setLoading(true);
        const response = await fetch(
          `/api/store/products?category=${categoryId}${
            query ? `&search=${encodeURIComponent(query)}` : ""
          }`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to ${query ? "search" : "fetch"} products`);
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(
            `Error ${query ? "searching" : "fetching"} products:`,
            err
          );
          setError(
            `Failed to ${query ? "search" : "load"} products. Please try again.`
          );
        }
      } finally {
        setLoading(false);
      }

      return () => {
        controller.abort();
      };
    },
    [categoryId]
  ); // Only depend on categoryId

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
        title={categoryName}
        description={`Browse our selection of ${categoryName.toLowerCase()}`}
        onSearch={handleSearch}
      />

      <Link
        href="/dashboard/marketplace"
        className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Categories
      </Link>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                className="h-full overflow-hidden transition-opacity duration-300"
              >
                <div className="relative h-48 bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-muted-foreground/30"
                        />
                      ))}
                  </div>
                  <div className="h-7 bg-muted rounded animate-pulse w-1/4 mt-2" />
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded animate-pulse w-full" />
                </CardFooter>
              </Card>
            ))}
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
      ) : products.length > 0 ? (
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
                  {product.requires_prescription && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">Prescription Required</Badge>
                    </div>
                  )}
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
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
