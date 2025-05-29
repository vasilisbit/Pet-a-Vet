import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import * as cartModel from "@/lib/db/models/cart";
import * as productModel from "@/lib/db/models/product";

export async function GET() {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create cart for user
    const cart = await cartModel.getOrCreateCart(user.id);

    // Get cart items with proper error handling
    let items = [];
    try {
      items = await cartModel.getCartItems(cart.cart_id);
    } catch (itemError) {
      console.error("Error fetching cart items:", itemError);
      // Continue with empty items array
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number.parseFloat(item.price_at_addition.toString()) * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      cartId: cart.cart_id,
      items,
      subtotal,
      shipping,
      tax,
      total,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cart",
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      },
      { status: 200 }
    ); // Return 200 with empty cart instead of 500
  }
}

export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Get or create cart for user
    const cart = await cartModel.getOrCreateCart(user.id);

    // Process cart action with user validation
    if (data.action === "add") {
      // Validate product exists
      const product = await productModel.findProductById(
        Number.parseInt(data.item.id)
      );
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Add item to cart with user validation
      await cartModel.addCartItem(
        cart.cart_id,
        product.product_id,
        data.item.quantity || 1,
        Number.parseFloat(product.price.toString()),
        user.id // Pass user ID for validation
      );
    } else if (data.action === "update") {
      // Find cart item and validate ownership
      const items = await cartModel.getCartItems(cart.cart_id);
      const item = items.find(
        (item) => item.product_id.toString() === data.item.id.toString()
      );

      if (item) {
        await cartModel.updateCartItemQuantity(
          item.cart_item_id,
          data.item.quantity
        );
      } else {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }
    } else if (data.action === "remove") {
      // Find cart item and validate ownership
      const items = await cartModel.getCartItems(cart.cart_id);
      const item = items.find(
        (item) => item.product_id.toString() === data.item.id.toString()
      );

      if (item) {
        await cartModel.removeCartItem(item.cart_item_id);
      } else {
        return NextResponse.json(
          { error: "Item not found in cart" },
          { status: 404 }
        );
      }
    } else if (data.action === "clear") {
      await cartModel.clearCart(cart.cart_id);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get updated cart items
    const items = await cartModel.getCartItems(cart.cart_id);

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number.parseFloat(item.price_at_addition.toString()) * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      cartId: cart.cart_id,
      items,
      subtotal,
      shipping,
      tax,
      total,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update cart",
      },
      { status: 500 }
    );
  }
}
