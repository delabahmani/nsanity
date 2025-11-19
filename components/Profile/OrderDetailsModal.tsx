"use client";

import Image from "next/image";
import Modal from "../Modal";
import { Calendar, CreditCard, MapPin, Package } from "lucide-react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { useOrderContext } from "../OrderContext";
import type { Order, OrderItem } from "@/lib/queries/orders";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  const { refreshOrders } = useOrderContext();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "fulfilled":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Ensure orderItems is always an array and properly typed
  const orderItems: OrderItem[] = Array.isArray(order.orderItems)
    ? order.orderItems
    : [];

  // Calculate values with explicit number typing
  const subtotal: number = orderItems.reduce(
    (acc: number, item: OrderItem): number => {
      return acc + Number(item.price) * Number(item.quantity);
    },
    0
  );

  const totalItems: number = orderItems.reduce(
    (acc: number, item: OrderItem): number => {
      return acc + Number(item.quantity);
    },
    0
  );

  const shipping: number = 0;
  const tax: number = 0;
  const total: number = Number(order.totalAmount) || subtotal;

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    const res = await fetch(`/api/user/orders/${order.id}/cancel`, {
      method: "POST",
    });

    if (res.ok) {
      toast.success("Order cancelled successfully");
      await refreshOrders();
      onClose();
    } else {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="p-6 max-h-[80vh] md:max-h-none overflow-y-auto max-w-full box-border">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <p className="text-base md:text-lg font-semibold truncate max-w-full">
                #{order.orderCode || order.id}
              </p>

              <span
                className={`mt-2 sm:mt-0 w-1/2 justify-center sm:w-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  order.status
                )}`}
                style={{ lineHeight: 1 }}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg min-w-0">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Order Date</p>
              <p className="text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Total Items */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg min-w-0">
            <Package className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-sm">{totalItems} items</p>
            </div>
          </div>

          {/* Order Total */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg min-w-0">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Order Total</p>
              <p className="text-sm font-semibold">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Items Ordered */}
        <div className="mb-6 min-w-0">
          <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden min-w-0">
            {orderItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-4 ${
                  index !== orderItems.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } min-w-0`}
              >
                <div className="shrink-0">
                  <Image
                    src={
                      item.product?.images?.[0] || "/images/placeholder.webp"
                    }
                    alt={item.product?.name || "Product"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg border object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm md:text-base truncate wrap-break-word">
                    {item.product?.name || "Unknown Product"}
                  </h4>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 text-sm text-gray-600">
                    <span className="truncate">
                      Size: <span className="font-medium">{item.size}</span>
                    </span>
                    <span className="truncate">
                      Color: <span className="font-medium">{item.color}</span>
                    </span>
                    <span className="truncate">
                      Qty: <span className="font-medium">{item.quantity}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 text-right flex items-center gap-2 ">
                  <p className="font-semibold">
                    ${Number(item.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Information */}
          <div className="p-4 bg-gray-50 rounded-lg min-w-0">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Status:{" "}
                <span className="font-medium capitalize">{order.status}</span>
              </p>
              <p className="mt-2">
                Tracking information will be provided once your order ships.
              </p>
              {order.status === "fulfilled" && (
                <p className="text-green-600 font-medium">
                  ✓ Your order has been fulfilled!
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-lg min-w-0">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{tax === 0 ? "$0.00" : `$${tax.toFixed(2)}`}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="default"
            className="w-full md:flex-1"
            onClick={handleDownloadReceipt}
          >
            Print Receipt
          </Button>
          <Button variant="default" className="w-full md:flex-1" disabled>
            Track Order
          </Button>
          {order.status === "pending" && (
            <Button
              variant="ghost"
              className="w-full md:flex-1 text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
