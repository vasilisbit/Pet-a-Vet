// Mock the database connection first
jest.mock("@/lib/db/connection", () => ({
  query: jest.fn(),
}));

import {
  getOrCreateCart,
  addCartItem,
  getCartItems,
} from "@/lib/db/models/cart";

describe("Cart Isolation", () => {
  describe("Cart Creation", () => {
    it("should create separate carts for different users", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock no existing cart
      mockQuery.mockResolvedValueOnce([]);
      // Mock cart creation
      mockQuery.mockResolvedValueOnce({ insertId: 1 });

      const cart1 = await getOrCreateCart(101);

      // Reset and test for second user
      mockQuery.mockClear();
      mockQuery.mockResolvedValueOnce([]);
      mockQuery.mockResolvedValueOnce({ insertId: 2 });

      const cart2 = await getOrCreateCart(102);

      expect(cart1.cart_id).toBe(1);
      expect(cart2.cart_id).toBe(2);
      expect(cart1.customer_id).toBe(101);
      expect(cart2.customer_id).toBe(102);
    });

    it("should return existing cart for returning user", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Clear any previous calls
      mockQuery.mockClear();

      // Mock existing cart
      mockQuery.mockResolvedValueOnce([{ cart_id: 5, customer_id: 101 }]);

      const cart = await getOrCreateCart(101);

      expect(cart.cart_id).toBe(5);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM Cart WHERE customer_id = ?",
        [101]
      );
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cart Item Management", () => {
    it("should prevent adding items to another users cart", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock cart ownership check - no matching cart
      mockQuery.mockResolvedValueOnce([]);

      await expect(
        addCartItem(1, 100, 2, 29.99, 999) // Wrong customer ID
      ).rejects.toThrow("Cart not found or access denied");
    });

    it("should allow adding items to own cart", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock cart ownership check - matching cart
      mockQuery.mockResolvedValueOnce([{ cart_id: 1, customer_id: 101 }]);
      // Mock no existing item
      mockQuery.mockResolvedValueOnce([]);
      // Mock insert
      mockQuery.mockResolvedValueOnce({ insertId: 50 });

      const itemId = await addCartItem(1, 100, 2, 29.99, 101);

      expect(itemId).toBe(50);
    });

    it("should update quantity for existing items", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      // Mock cart ownership check
      mockQuery.mockResolvedValueOnce([{ cart_id: 1, customer_id: 101 }]);
      // Mock existing item
      mockQuery.mockResolvedValueOnce([
        { cart_item_id: 25, product_id: 100, quantity: 1 },
      ]);
      // Mock update
      mockQuery.mockResolvedValueOnce({ affectedRows: 1 });

      const itemId = await addCartItem(1, 100, 2, 29.99, 101);

      expect(itemId).toBe(25);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE CartItem"),
        expect.arrayContaining([2, 29.99, 25])
      );
    });
  });

  describe("Cart Retrieval", () => {
    it("should only return items from the specified cart", async () => {
      const mockQuery = require("@/lib/db/connection").query;

      mockQuery.mockResolvedValueOnce([
        { cart_item_id: 1, cart_id: 5, product_id: 100, quantity: 2 },
        { cart_item_id: 2, cart_id: 5, product_id: 101, quantity: 1 },
      ]);

      const items = await getCartItems(5);

      expect(items).toHaveLength(2);
      expect(items.every((item) => item.cart_id === 5)).toBe(true);
    });
  });
});
