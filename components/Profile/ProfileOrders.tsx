"use client";

import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import OrderDetailsModal from "./OrderDetailsModal";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color: string;
  size: string;
  price: number;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderCode?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export default function ProfileOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/user/orders");

        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }

        const data = await res.json();

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <div className="animate-pulse">Loading orders...</div>
      </div>
    );
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (error) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-red-600">
          <Package className="w-5 h-5" /> Error Loading Orders
        </h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" /> Order History
        </h2>
        <div className="text-gray-500">You have no orders yet.</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" /> Order History
        </h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Order {order.orderCode || order.id}
                </div>
                <div className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {order.orderItems?.length || 0} items
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Status: <span className="capitalize">{order.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 md:mt-0">
                <span className="font-semibold text-lg">
                  ${order.totalAmount?.toFixed(2) ?? "0.00"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(order)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          order={selectedOrder}
        />
      )}
    </>
  );
}
