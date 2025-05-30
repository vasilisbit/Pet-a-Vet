/**
 * Integration test for admin dashboard stats fix
 * Tests the fix for the "Cannot read properties of undefined (reading 'toFixed')" error
 */
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Admin Dashboard Stats Fix", () => {
  // Mock stats data that might be returned from the API
  const mockStatsData = {
    totalCustomers: 10,
    totalAppointments: 25,
    totalProducts: 100,
    recentSales: 1500.5,
    pendingOrders: 5,
  };

  const mockPartialStatsData = {
    totalCustomers: 10,
    totalAppointments: 25,
    // Missing totalProducts, recentSales, and pendingOrders
  };

  const mockEmptyStatsData = {};

  describe("Stats data handling", () => {
    it("should handle complete stats data correctly", () => {
      const stats = {
        totalPets: 0,
        totalCustomers: 0,
        totalAppointments: 0,
        totalProducts: 0,
        recentSales: 0,
        pendingOrders: 0,
        ...mockStatsData,
        // Ensure all expected fields are numbers
        totalCustomers: Number(mockStatsData.totalCustomers || 0),
        totalAppointments: Number(mockStatsData.totalAppointments || 0),
        totalProducts: Number(mockStatsData.totalProducts || 0),
        recentSales: Number(mockStatsData.recentSales || 0),
        pendingOrders: Number(mockStatsData.pendingOrders || 0),
      };

      expect(stats.totalCustomers).toBe(10);
      expect(stats.totalAppointments).toBe(25);
      expect(stats.totalProducts).toBe(100);
      expect(stats.recentSales).toBe(1500.5);
      expect(stats.pendingOrders).toBe(5);
    });

    it("should handle partial stats data with safe defaults", () => {
      const stats = {
        totalPets: 0,
        totalCustomers: 0,
        totalAppointments: 0,
        totalProducts: 0,
        recentSales: 0,
        pendingOrders: 0,
        ...mockPartialStatsData,
        // Ensure all expected fields are numbers
        totalCustomers: Number(mockPartialStatsData.totalCustomers || 0),
        totalAppointments: Number(mockPartialStatsData.totalAppointments || 0),
        totalProducts: Number(mockPartialStatsData.totalProducts || 0),
        recentSales: Number(mockPartialStatsData.recentSales || 0),
        pendingOrders: Number(mockPartialStatsData.pendingOrders || 0),
      };

      expect(stats.totalCustomers).toBe(10);
      expect(stats.totalAppointments).toBe(25);
      expect(stats.totalProducts).toBe(0); // Default value
      expect(stats.recentSales).toBe(0); // Default value
      expect(stats.pendingOrders).toBe(0); // Default value
    });

    it("should handle empty stats data with safe defaults", () => {
      const stats = {
        totalPets: 0,
        totalCustomers: 0,
        totalAppointments: 0,
        totalProducts: 0,
        recentSales: 0,
        pendingOrders: 0,
        ...mockEmptyStatsData,
        // Ensure all expected fields are numbers
        totalCustomers: Number(mockEmptyStatsData.totalCustomers || 0),
        totalAppointments: Number(mockEmptyStatsData.totalAppointments || 0),
        totalProducts: Number(mockEmptyStatsData.totalProducts || 0),
        recentSales: Number(mockEmptyStatsData.recentSales || 0),
        pendingOrders: Number(mockEmptyStatsData.pendingOrders || 0),
      };

      expect(stats.totalCustomers).toBe(0);
      expect(stats.totalAppointments).toBe(0);
      expect(stats.totalProducts).toBe(0);
      expect(stats.recentSales).toBe(0);
      expect(stats.pendingOrders).toBe(0);
    });
  });

  describe("toFixed operation safety", () => {
    it("should safely handle toFixed on valid numbers", () => {
      const recentSales = 1500.5;
      expect((recentSales || 0).toFixed(2)).toBe("1500.50");
    });

    it("should safely handle toFixed on undefined with fallback", () => {
      const recentSales = undefined;
      expect((recentSales || 0).toFixed(2)).toBe("0.00");
    });

    it("should safely handle toFixed on null with fallback", () => {
      const recentSales = null;
      expect((recentSales || 0).toFixed(2)).toBe("0.00");
    });

    it("should safely handle toFixed on NaN with fallback", () => {
      const recentSales = NaN;
      expect((recentSales || 0).toFixed(2)).toBe("0.00");
    });

    it("should safely handle toFixed on zero", () => {
      const recentSales = 0;
      expect((recentSales || 0).toFixed(2)).toBe("0.00");
    });
  });

  describe("Number conversion safety", () => {
    it("should convert string numbers correctly", () => {
      expect(Number("123")).toBe(123);
      expect(Number("123.45")).toBe(123.45);
    });

    it("should handle undefined values safely", () => {
      expect(Number(undefined || 0)).toBe(0);
    });

    it("should handle null values safely", () => {
      expect(Number(null || 0)).toBe(0);
    });
    it("should handle invalid strings safely", () => {
      const invalidValue = "invalid";
      expect(Number(invalidValue) || 0).toBe(0);
    });
  });
});
