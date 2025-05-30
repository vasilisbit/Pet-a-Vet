"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// Mock product data - in a real app, this would come from an API
const product = {
  id: "med-1",
  name: "Flea & Tick Prevention",
  price: 29.99,
  rating: 4.5,
  reviewCount: 128,
  description:
    "Effective monthly flea and tick prevention for dogs and cats. Protects your pet from parasites and prevents infestations.",
  longDescription: `
    <p>Our Flea & Tick Prevention is a veterinarian-recommended monthly treatment that provides complete protection against fleas, ticks, and other parasites.</p>
    <p>This easy-to-apply topical solution starts working within 24 hours and provides continuous protection for a full month.</p>
    <h3>Benefits:</h3>
    <ul>
      <li>Kills fleas, ticks, and mosquitoes on contact</li>
      <li>Prevents new infestations</li>
      <li>Waterproof formula remains effective after bathing</li>
      <li>Safe for dogs and cats over 8 weeks of age</li>
      <li>Available in different doses based on pet weight</li>
    </ul>
    <p>Regular use helps protect your pet from diseases transmitted by parasites, including Lyme disease, heartworm, and tapeworms.</p>
  `,
  specifications: [
    { name: "Active Ingredient", value: "Fipronil 9.8%, (S)-methoprene 8.8%" },
    { name: "For", value: "Dogs and Cats" },
    { name: "Age Range", value: "8 weeks and older" },
    { name: "Weight Range", value: "5-22 lbs" },
    { name: "Duration", value: "30 days of protection" },
    { name: "Application", value: "Topical" },
    { name: "Package Contents", value: "3 applicator tubes" },
    { name: "Storage", value: "Store in a cool, dry place" },
  ],
  images: [
    "/placeholder.svg?height=400&width=400&query=flea%20tick%20medicine%20package",
    "/placeholder.svg?height=400&width=400&query=flea%20tick%20medicine%20applicator",
    "/placeholder.svg?height=400&width=400&query=pet%20flea%20treatment",
  ],
  inStock: true,
  stockQuantity: 24,
  tags: ["dogs", "cats", "prevention", "parasites"],
  brand: "PetHealth Plus",
  sku: "FTP-3PACK-SM",
  relatedProducts: [
    {
      id: "med-6",
      name: "Heartworm Prevention",
      price: 39.99,
      image: "/placeholder.svg?height=100&width=100&query=heartworm%20medicine",
    },
    {
      id: "med-5",
      name: "Ear Cleaning Solution",
      price: 14.99,
      image:
        "/placeholder.svg?height=100&width=100&query=ear%20cleaning%20solution",
    },
  ],
};

export default function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          item: {
            id: product.id,
            quantity: quantity,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item to cart");
      }

      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="mb-4 border rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-[400px] object-contain"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border rounded min-w-[80px] h-[80px] overflow-hidden ${
                  selectedImage === index
                    ? "border-teal-600 ring-2 ring-teal-200"
                    : "border-gray-200"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : i < product.rating
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {product.description}
          </p>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Availability:
              </span>
              {product.inStock ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  In Stock ({product.stockQuantity} available)
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  Out of Stock
                </Badge>
              )}
            </div>
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                SKU:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.sku}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Brand:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.brand}
              </span>
            </div>
          </div>

          {product.inStock && (
            <div className="flex items-center mb-6">
              <div className="flex items-center border rounded-md mr-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-center w-12">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stockQuantity}
                  title="Increase quantity"
                  aria-label="Increase quantity"
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                className="flex-1"
                onClick={addToCart}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-teal-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Free shipping over $50
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-teal-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Satisfaction guaranteed
              </span>
            </div>
            <div className="flex items-center">
              <RotateCcw className="h-5 w-5 text-teal-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                30-day returns
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="py-4">
          <div
            dangerouslySetInnerHTML={{ __html: product.longDescription }}
            className="prose max-w-none"
          />
        </TabsContent>
        <TabsContent value="specifications" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.map((spec, index) => (
              <div key={index} className="flex border-b border-gray-100 py-2">
                <span className="font-medium text-gray-700 w-1/2">
                  {spec.name}:
                </span>
                <span className="text-gray-600 w-1/2">{spec.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
            <p className="text-gray-600 mb-4">
              This product has {product.reviewCount} reviews with an average
              rating of {product.rating} stars.
            </p>
            <Button variant="outline">Write a Review</Button>
          </div>
        </TabsContent>
      </Tabs>

      {product.relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <Link
                href={`/store/product/${relatedProduct.id}`}
                key={relatedProduct.id}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <img
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-32 object-contain mb-3"
                    />
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="font-bold text-gray-900">
                      ${relatedProduct.price.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
