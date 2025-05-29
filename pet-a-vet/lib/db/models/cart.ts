import { query } from "../connection";
import type { Cart, CartItem } from "./interfaces";

export async function findCartByCustomerId(
  customerId: number
): Promise<Cart | null> {
  try {
    const carts = await query<Cart[]>(
      "SELECT * FROM Cart WHERE customer_id = ?",
      [customerId]
    );
    return carts.length > 0 ? carts[0] : null;
  } catch (error) {
    console.error("Error finding cart by customer ID:", error);
    throw error;
  }
}

export async function createCart(customerId: number): Promise<number> {
  try {
    const result = await query<any>(
      "INSERT INTO Cart (customer_id) VALUES (?)",
      [customerId]
    );

    return result.insertId;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
}

// Add this function after createCart
export async function getOrCreateCart(customerId: number): Promise<Cart> {
  try {
    // First try to find existing cart
    let cart = await findCartByCustomerId(customerId);

    if (!cart) {
      // Create new cart if none exists
      const cartId = await createCart(customerId);
      cart = {
        cart_id: cartId,
        customer_id: customerId,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    return cart;
  } catch (error) {
    console.error("Error getting or creating cart:", error);
    throw error;
  }
}

export async function getCartItems(cartId: number): Promise<CartItem[]> {
  try {
    return await query<CartItem[]>(
      `SELECT ci.*, p.name as product_name, p.image_url 
       FROM CartItem ci 
       JOIN Product p ON ci.product_id = p.product_id 
       WHERE ci.cart_id = ?`,
      [cartId]
    );
  } catch (error) {
    console.error("Error getting cart items:", error);
    throw error;
  }
}

// Update the addCartItem function to validate ownership
export async function addCartItem(
  cartId: number,
  productId: number,
  quantity: number,
  price: number,
  customerId?: number
): Promise<number> {
  try {
    // If customerId is provided, verify cart ownership
    if (customerId) {
      const cart = await query<Cart[]>(
        "SELECT * FROM Cart WHERE cart_id = ? AND customer_id = ?",
        [cartId, customerId]
      );
      if (cart.length === 0) {
        throw new Error("Cart not found or access denied");
      }
    }

    // Check if the item already exists in the cart
    const existingItems = await query<CartItem[]>(
      "SELECT * FROM CartItem WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );

    if (existingItems.length > 0) {
      // Update the existing item
      await query<any>(
        "UPDATE CartItem SET quantity = quantity + ?, price = ? WHERE cart_item_id = ?",
        [quantity, price, existingItems[0].cart_item_id]
      );

      return existingItems[0].cart_item_id;
    } else {
      // Add a new item
      const result = await query<any>(
        "INSERT INTO CartItem (cart_id, product_id, quantity, price_at_addition) VALUES (?, ?, ?, ?)",
        [cartId, productId, quantity, price]
      );

      return result.insertId;
    }
  } catch (error) {
    console.error("Error adding cart item:", error);
    throw error;
  }
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
): Promise<boolean> {
  try {
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      return await removeCartItem(cartItemId);
    }

    const result = await query<any>(
      "UPDATE CartItem SET quantity = ? WHERE cart_item_id = ?",
      [quantity, cartItemId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw error;
  }
}

export async function removeCartItem(cartItemId: number): Promise<boolean> {
  try {
    const result = await query<any>(
      "DELETE FROM CartItem WHERE cart_item_id = ?",
      [cartItemId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
}

export async function clearCart(cartId: number): Promise<boolean> {
  try {
    const result = await query<any>("DELETE FROM CartItem WHERE cart_id = ?", [
      cartId,
    ]);

    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

export async function getCartTotal(cartId: number): Promise<number> {
  try {
    const result = await query<any>(
      "SELECT SUM(quantity * price) as total FROM CartItem WHERE cart_id = ?",
      [cartId]
    );

    return result[0].total || 0;
  } catch (error) {
    console.error("Error calculating cart total:", error);
    throw error;
  }
}
