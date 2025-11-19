"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import OrderDetailsModal from "./OrderDetailsModal";
import LoadingSpinner from "../LoadingSpinner";
import { useOrderContext } from "../OrderContext";
import type { Order } from "@/lib/queries/orders";

export default function ProfileOrders() {
  const { orders, isLoading, error } = useOrderContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <div className="bg-nsanity-white rounded-xl shadow p-6">
        <LoadingSpinner size="large" />
      </div>
    );
  }

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
