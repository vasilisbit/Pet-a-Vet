"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Search,
  Eye,
  Edit,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isReceiveOrderOpen, setIsReceiveOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [orderType, setOrderType] = useState("supplier"); // New state for order type
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders based on type
  const fetchOrders = async (type: string = "supplier") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/warehouse/orders?type=${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and when orderType changes
  React.useEffect(() => {
    fetchOrders(orderType);
  }, [orderType]);

  // Mock suppliers data
  const suppliers = [
    { id: 1, name: "MedVet Supplies" },
    { id: 2, name: "PharmaVet" },
    { id: 3, name: "PetHealth Inc." },
  ];

  // Mock inventory items for ordering
  const inventoryItems = [
    {
      id: 1,
      name: "Rabies Vaccine",
      category: "Vaccine",
      currentStock: 45,
      minStock: 20,
      unit: "vial",
      price: 25.99,
      supplier: "MedVet Supplies",
    },
    {
      id: 2,
      name: "Antibiotics - Amoxicillin",
      category: "Medication",
      currentStock: 12,
      minStock: 15,
      unit: "bottle",
      price: 18.5,
      supplier: "PharmaVet",
    },
    {
      id: 3,
      name: "Flea & Tick Treatment",
      category: "Medication",
      currentStock: 32,
      minStock: 10,
      unit: "pack",
      price: 35.75,
      supplier: "PetHealth Inc.",
    },
    {
      id: 4,
      name: "Surgical Gloves",
      category: "Equipment",
      currentStock: 150,
      minStock: 50,
      unit: "pair",
      price: 8.99,
      supplier: "MedVet Supplies",
    },
    {
      id: 5,
      name: "Distemper Vaccine",
      category: "Vaccine",
      currentStock: 28,
      minStock: 15,
      unit: "vial",
      price: 22.5,
      supplier: "PharmaVet",
    },
  ];

  // New order form state
  const [newOrder, setNewOrder] = useState({
    supplier: "",
    expectedDelivery: "",
    notes: "",
    items: [] as {
      id: number;
      name: string;
      quantity: number;
      unit: string;
      price: number;
    }[],
  });

  // Filter orders based on search query and tab
  const filteredOrders = orders.filter((order) => {
    const searchTerm = searchQuery.toLowerCase();
    let matchesSearch = false;

    if (orderType === "customer") {
      // For customer orders, search by customer name, email, or order ID
      matchesSearch =
        order.id?.toLowerCase().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.customerEmail?.toLowerCase().includes(searchTerm);
    } else {
      // For supplier orders, search by supplier name or order ID
      matchesSearch =
        order.id?.toLowerCase().includes(searchTerm) ||
        order.supplier?.toLowerCase().includes(searchTerm);
    }

    const matchesTab = selectedTab === "all" || order.status === selectedTab;

    return matchesSearch && matchesTab;
  });

  // Handle adding item to order
  const handleAddItemToOrder = (item: any) => {
    if (newOrder.items.some((i) => i.id === item.id)) {
      return; // Item already added
    }

    setNewOrder({
      ...newOrder,
      items: [
        ...newOrder.items,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          unit: item.unit,
          price: item.price,
        },
      ],
    });
  };

  // Handle removing item from order
  const handleRemoveItemFromOrder = (itemId: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((item) => item.id !== itemId),
    });
  };

  // Handle quantity change
  const handleQuantityChange = (itemId: number, quantity: number) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return newOrder.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Create new order (only for supplier orders)
  const handleCreateOrder = async () => {
    try {
      const newOrderData = {
        supplier: newOrder.supplier,
        expectedDelivery: newOrder.expectedDelivery,
        notes: newOrder.notes,
        items: newOrder.items,
      };

      const response = await fetch("/api/warehouse/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrderData),
      });

      if (response.ok) {
        setNewOrder({
          supplier: "",
          expectedDelivery: "",
          notes: "",
          items: [],
        });
        setIsCreateOrderOpen(false);
        // Refresh orders
        fetchOrders(orderType);
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Prepare to receive order
  const handlePrepareReceiveOrder = (order: any) => {
    setSelectedOrder(order);
    setIsReceiveOrderOpen(true);
  };

  // Receive order
  const handleReceiveOrder = () => {
    // In a real app, this would update the inventory and order status
    setOrders(
      orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: "completed" }
          : order
      )
    );
    setIsReceiveOrderOpen(false);
  };

  // Return to warehouse management
  const returnToWarehouse = () => {
    router.push("/dashboard/warehouse");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Pending
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Delivered
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={returnToWarehouse}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Manage Orders</h1>
        </div>
        {orderType === "supplier" && (
          <Button onClick={() => setIsCreateOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Order Type Toggle */}
        <Tabs
          value={orderType}
          onValueChange={setOrderType}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="supplier">Supplier Orders</TabsTrigger>
            <TabsTrigger value="customer">Customer Orders</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder={
              orderType === "customer"
                ? "Search by customer name, email, or order ID..."
                : "Search orders..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading orders...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  {orderType === "customer" ? (
                    <>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Payment Status</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                    </>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    {orderType === "customer" ? (
                      <>
                        <TableCell>{order.customerName || "N/A"}</TableCell>
                        <TableCell>{order.customerEmail || "N/A"}</TableCell>
                        <TableCell>
                          {order.orderDate || order.createdAt}
                        </TableCell>
                        <TableCell>{order.paymentStatus || "N/A"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{order.expectedDelivery}</TableCell>
                      </>
                    )}
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.totalItems || order.items?.length || 0}
                    </TableCell>
                    <TableCell>
                      ${(order.totalCost || order.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {orderType === "supplier" &&
                            order.status === "pending" && (
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit Order
                              </DropdownMenuItem>
                            )}
                          {orderType === "supplier" &&
                            (order.status === "shipped" ||
                              order.status === "delivered") && (
                              <DropdownMenuItem
                                onClick={() => handlePrepareReceiveOrder(order)}
                              >
                                <Truck className="mr-2 h-4 w-4" /> Receive Order
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No {orderType} orders found. Try adjusting your search or
                      filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Create a new order for products from suppliers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={newOrder.supplier}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, supplier: value })
                  }
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={newOrder.expectedDelivery}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      expectedDelivery: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, notes: e.target.value })
                  }
                  placeholder="Add any special instructions or notes"
                />
              </div>
              <div className="space-y-2">
                <Label>Order Summary</Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span>
                          {newOrder.items.reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span>${calculateTotalCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add Products</Label>
                <div className="border rounded-md p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  <Input
                    placeholder="Search products..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="space-y-2">
                    {inventoryItems
                      .filter(
                        (item) =>
                          item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) &&
                          (!newOrder.supplier ||
                            item.supplier === newOrder.supplier)
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddItemToOrder(item)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              Stock: {item.currentStock} {item.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div>${item.price.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">
                              {item.supplier}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {newOrder.items.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.id,
                                    Number.parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveItemFromOrder(item.id)
                                }
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No items added to order yet. Search and click on products
                      to add them.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOrderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={
                !newOrder.supplier ||
                !newOrder.expectedDelivery ||
                newOrder.items.length === 0
              }
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Order Dialog */}
      <Dialog open={isReceiveOrderOpen} onOpenChange={setIsReceiveOrderOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Receive Order: {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Confirm receipt of items and update inventory.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <div className="font-medium">{selectedOrder.supplier}</div>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <div className="font-medium">{selectedOrder.orderDate}</div>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <div className="font-medium">
                    {selectedOrder.expectedDelivery}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Order Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Ordered Qty</TableHead>
                      <TableHead>Received Qty</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            defaultValue={item.quantity}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input type="date" className="w-40" />
                        </TableCell>
                        <TableCell>
                          <Checkbox defaultChecked />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiveNotes">Notes</Label>
                <Textarea
                  id="receiveNotes"
                  placeholder="Add any notes about the received order"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReceiveOrderOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReceiveOrder}>Confirm Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
