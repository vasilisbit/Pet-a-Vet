import { query } from "../connection";
import type { Order, OrderItem } from "./interfaces";
import { getCartItems } from "./cart";

export async function findOrderById(orderId: number): Promise<Order | null> {
  try {
    const orders = await query<Order[]>(
      "SELECT * FROM `Order` WHERE order_id = ?",
      [orderId]
    );
    return orders.length > 0 ? orders[0] : null;
  } catch (error) {
    console.error("Error finding order by ID:", error);
    throw error;
  }
}

export async function findOrdersByCustomerId(
  customerId: number
): Promise<Order[]> {
  try {
    return await query<Order[]>(
      "SELECT * FROM `Order` WHERE customer_id = ? ORDER BY order_date DESC",
      [customerId]
    );
  } catch (error) {
    console.error("Error finding orders by customer ID:", error);
    throw error;
  }
}

export async function createOrderFromCart(
  customerId: number,
  cartId: number,
  paymentMethod: "CARD" | "CASH",
  shippingAddress: string,
  notes?: string
): Promise<number> {
  const connection = await (await import("../connection")).getConnection();

  try {
    await connection.beginTransaction();

    // Get cart items
    const cartItems = await getCartItems(cartId);

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price_at_addition,
      0
    );

    // Create order
    const orderResult = await connection.execute(
      `INSERT INTO \`Order\` (customer_id, total_amount, status, payment_method, payment_status, shipping_address, notes) 
       VALUES (?, ?, 'PENDING', ?, 'PENDING', ?, ?)`,
      [customerId, totalAmount, paymentMethod, shippingAddress, notes || null]
    );

    const orderId = (orderResult[0] as any).insertId;

    // Create order items
    for (const item of cartItems) {
      await connection.execute(
        "INSERT INTO OrderItem (order_id, product_id, quantity, price_at_purchase, discount) VALUES (?, ?, ?, ?, 0)",
        [orderId, item.product_id, item.quantity, item.price_at_addition]
      );

      // Update inventory
      await connection.execute(
        "UPDATE Inventory SET quantity = quantity - ? WHERE product_id = ?",
        [item.quantity, item.product_id]
      );
    }

    // Clear the cart
    await connection.execute("DELETE FROM CartItem WHERE cart_id = ?", [
      cartId,
    ]);

    await connection.commit();

    return orderId;
  } catch (error) {
    await connection.rollback();
    console.error("Error creating order from cart:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  try {
    return await query<OrderItem[]>(
      `SELECT oi.*, p.name as product_name, p.image_url 
       FROM OrderItem oi 
       JOIN Product p ON oi.product_id = p.product_id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
  } catch (error) {
    console.error("Error getting order items:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
): Promise<boolean> {
  try {
    const result = await query<any>(
      "UPDATE `Order` SET status = ? WHERE order_id = ?",
      [status, orderId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export async function updatePaymentStatus(
  orderId: number,
  status: "PENDING" | "PAID" | "REFUNDED"
): Promise<boolean> {
  try {
    const result = await query<any>(
      "UPDATE `Order` SET payment_status = ? WHERE order_id = ?",
      [status, orderId]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

export async function cancelOrder(orderId: number): Promise<boolean> {
  const connection = await (await import("../connection")).getConnection();

  try {
    await connection.beginTransaction();

    // Get order items
    const orderItems = await getOrderItems(orderId);

    // Update order status
    await connection.execute(
      'UPDATE `Order` SET status = "CANCELLED" WHERE order_id = ?',
      [orderId]
    );

    // Return items to inventory
    for (const item of orderItems) {
      await connection.execute(
        "UPDATE Inventory SET quantity = quantity + ? WHERE product_id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error cancelling order:", error);
    throw error;
  } finally {
    connection.release();
  }
}
