"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/store/products?id=${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);

        // Store the category ID for proper back navigation
        if (data && data.category) {
          setCategoryId(data.category.toLowerCase());
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
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
            quantity: quantity,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      // Navigate to cart
      router.push("/dashboard/marketplace/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add product to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard/marketplace"
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Marketplace
        </Link>
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error || "Product not found"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={
          categoryId
            ? `/dashboard/marketplace/category/${categoryId}`
            : "/dashboard/marketplace"
        }
        className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {categoryId
          ? `Back to ${
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
            }`
          : "Back to Marketplace"}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg overflow-hidden border">
            <img
              src={
                product.image_url ||
                "/placeholder.svg?height=400&width=600&query=pet%20product"
              }
              alt={product.name}
              className="w-full h-auto object-contain aspect-square"
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {product.name}
          </h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 4)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              <span className="ml-2 text-muted-foreground">
                {product.rating || 4.0} stars
              </span>
            </div>
            <Badge variant="outline" className="ml-2">
              {product.category}
            </Badge>
            {product.requires_prescription && (
              <Badge variant="secondary" className="ml-2">
                Prescription Required
              </Badge>
            )}
          </div>

          <div className="text-3xl font-bold text-foreground mb-4">
            ${Number.parseFloat(product.price).toFixed(2)}
          </div>

          <p className="text-foreground mb-6">{product.description}</p>

          <div className="flex items-center mb-6">
            <div className="flex items-center border rounded-md mr-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                title="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-center w-12">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
                title="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          {product.requires_prescription && (
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                This product requires a prescription. You will be asked to
                provide a valid prescription during checkout.
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Manufacturer</span>
                <span className="font-medium text-foreground">
                  {product.manufacturer || "Pet-a-Vet"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium text-foreground">
                  {product.barcode || productId}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium text-green-600">In Stock</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6 border rounded-b-lg">
            <div className="prose max-w-none">
              <p>
                {product.description ||
                  "No detailed description available for this product."}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="p-6 border rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Product Specifications</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Brand</span>
                    <span>{product.manufacturer || "Pet-a-Vet"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{product.category}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Prescription Required
                    </span>
                    <span>{product.requires_prescription ? "Yes" : "No"}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free over $50</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Delivery
                    </span>
                    <span>2-4 Business Days</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Return Policy</span>
                    <span>30 Days</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-6 border rounded-b-lg">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No reviews yet for this product.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
