"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Truck, MapPin, CreditCard, Gift, Star, ArrowRight, Package, Calendar, Clock } from 'lucide-react';
import Navbar from "@/app/components/Navbar/Navbar";
import CategoryNav from "@/app/components/Categories/Categories";
import { format } from "date-fns";
import { subDays } from "date-fns";
import { useRouter } from "next/navigation";
import CancelItemsModal from "@/app/components/CancleItemsModal.jsx/CancleItemModel";

export default function CheckoutSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      setIsEmpty(false);

      const res = await fetch(`/api/order/${orderId}`);
      if (!res.ok) throw new Error("Order not found");

      const data = await res.json();
      if (!data || !data.id) throw new Error("Invalid data");

      console.log(data);
      setOrder(data);
      setItems(data.items);
    } catch (err) {
      setIsEmpty(true);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId,]);


  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      fetchOrderDetails(orderId);
      setLoading(false)
      // Optionally refresh UI here
    } catch (err) {
      console.error("Failed to update status:", err);
      setLoading(false)
      // Optionally show a toast or error message
    }
  };


  if (isEmpty) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-20 bg-white">
        <h1 className="text-xl md:text-3xl font-semibold text-gray-800 mb-2 uppercase">
          Order Not Found
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-md mb-6">
          We couldn’t find your order.
        </p>
        <button
          className="px-6 py-2 bg-yellow-400 text-black font-medium rounded-md hover:bg-yellow-500 transition uppercase text-sm md:text-base"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
    );
  }


  if (!order) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  }


  

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const getDiscountedPrice = (price, discountPercent) =>
    Math.round(price * (1 - discountPercent / 100));

  const subtotal = items?.reduce((sum, item) => {
    const qty = quantities[item.id] || 1;
    const price = Number(item.variant.product.price);
    const discount = Number(item.variant.product.discountPercent || 0);
    const additional = Number(item.variant.additionalPrice || 0);

    const discounted = getDiscountedPrice(price, discount);
    const finalPrice = discounted + additional;

    return sum + qty * finalPrice;

  }, 0);

  const ORDER_PROGRESS_FLOW = [
    "PENDING",        // ⬅️ Add this as the initial state
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const formatStatusToTitle = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending ";
      case "CONFIRMED":
        return "Order Confirmed";
      case "PACKED":
        return "Order Packed";
      case "SHIPPED":
        return "Order Shipped";
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";
      case "DELIVERED":
        return "Delivered";
      default:
        return status;
    }
  };


  const now = new Date();


  const existingSteps = order.history.reduce((acc, h) => {
    acc[h.status] = new Date(h.timestamp);
    return acc;
  }, {});

  // Ensure current status is included in steps even if not in history
  if (order.status && !existingSteps[order.status]) {
    existingSteps[order.status] = new Date(order.placedAt); // or new Date()
  }

  const currentStatusIndex = ORDER_PROGRESS_FLOW.indexOf(order.status || "PENDING");

  const steps = ORDER_PROGRESS_FLOW.map((status, index) => {
    const isReached = index <= currentStatusIndex;
    return {
      status,
      title: formatStatusToTitle(status),
      date: isReached ? (existingSteps[status] || new Date(order.placedAt)) : null,
    };
  });


  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });


  const isDelivered = order.status === 'DELIVERED'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <CategoryNav />

      {/* Success Banner */}
      <div className="bg-green-600 text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <h1 className="text-lg md:text-xl font-semibold uppercase">Order placed, thanks!</h1>
            <p className="text-green-100 text-sm uppercase">Confirmation will be sent to your email.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Summary */}
            <div className="bg-white shadow-xl rounded-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1 uppercase" >order #{order?.id}</h2>
                  <p className="text-gray-600 text-sm uppercase">
                    Placed on{" "}
                    {new Date(order.placedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                </div>
                <div className="mt-4 md:mt-0">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full uppercase">
                    Order Confirmed
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <div className="uppercase">
                    <h3 className="font-medium text-gray-900">Delivery</h3>
                    <p className="text-sm text-green-600 font-medium">FREE delivery</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 uppercase">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 ">Shipping Address</h3>
                    <p className="text-sm text-gray-600">{order?.shippingAddress?.fullName}<br />+91 {order?.shippingAddress?.phoneNumber}<br />{order?.shippingAddress?.addressLine1}<br />{order?.shippingAddress?.addressLine2}<br />{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="lg:col-span-2 order-2 lg:order-1 w-full">
                <div className="bg-white rounded-sm  p-6 mb-6 w-full">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-300 pb-10 ">
                    <h1 className="text-md font-semibold text-gray-700 uppercase">ITEMS IN THIS ORDERS</h1>
                  </div>

                  {items.map((item) => {
                    const product = item.variant.product;
                    const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
                    const qty = quantities[item.id] || 1;

                    return (
                      <div key={item.id} className="border-b border-gray-200 pb-6 mb-6">
                        <div className="flex flex-row sm:flex-row gap-4">
                          <div className="flex md:items-start gap-4">
                            <img
                              src={item.variant.images?.[0]?.imageUrl || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-gray-100 rounded-lg"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase cursor-pointer"
                              onClick={() => router.push(`/products/${item.variant.productId}`)}
                            >
                              {product.name}
                            </h3>

                            <div className="text-sm font-medium mb-2 uppercase">QTY : {item.quantity}</div>

                            <div className="md:hidden">
                              <div className="text-red-600 text-xl font-semibold mb-1">
                                {formatPrice(
                                  Number(discountedPrice ?? product.price) + Number(item.variant?.additionalPrice ?? 0)
                                )}
                              </div>
                              <div className="text-sm text-gray-500 line-through">
                                M.R.P.:{" "}
                                {formatPrice(Number(product.price) + Number(item.variant?.additionalPrice ?? 0))}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600 uppercase">
                                Variant: {item.variant.variantName}
                              </span>
                            </div>

                          </div>

                          <div className="text-right hidden md:block">
                            <div className="text-red-600 text-xl font-semibold mb-1">
                              {formatPrice(
                                Number(discountedPrice ?? product.price) + Number(item.variant?.additionalPrice ?? 0)
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              M.R.P.:{" "}
                              {formatPrice(Number(product.price) + Number(item.variant?.additionalPrice ?? 0))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Subtotal */}
                  <div className="pt-4 text-right">
                    <span className="text-md font-semibold uppercase">
                      TOTAL ({items.length} items): {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            <div className="bg-white shadow-xl rounded-md p-6">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg uppercase">
                Track your package
              </h3>

              {["CANCELLED", "RETURN_REQUESTED", "RETURNED"].includes(order.status) ? (
                <div
                  className={`p-4 rounded-md mb-6 uppercase font-semibold text-sm
        ${order.status === "CANCELLED" ? "bg-red-100 text-red-800" : ""}
        ${order.status === "RETURN_REQUESTED" ? "bg-yellow-100 text-yellow-800" : ""}
        ${order.status === "RETURNED" ? "bg-green-100 text-green-800" : ""}`}
                >
                  Order {order.status.replaceAll("_", " ").toLowerCase()}
                </div>
              ) : (
                <div className="relative ml-4">
                  {steps.map((step, index) => {
                    const isCompleted = step.date && now >= step.date;
                    const isLast = index === steps.length - 1;

                    return (
                      <div key={index} className="relative flex items-start pb-8">
                        {/* Vertical Line */}
                        {!isLast && (
                          <span
                            className={`absolute left-1.5 top-3 h-full w-[3px] z-0 ${isCompleted ? "bg-green-500" : "bg-gray-300"
                              }`}
                          />
                        )}

                        {/* Dot */}
                        <div className="relative z-10">
                          <span
                            className={`w-4 h-4 rounded-full block border-2 ${isCompleted
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                              }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="ml-4">
                          <p
                            className={`text-md font-medium uppercase ${isCompleted ? "text-gray-900" : "text-gray-500"
                              }`}
                          >
                            {step.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {step.date
                              ? format(step.date, "MMMM dd, yyyy - hh:mm a")
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>



            {/* Actions */}
            <div className="bg-white shadow-xl rounded-md p-6 uppercase">
              <h3 className="font-semibold text-gray-900 mb-4">Need help with your order?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {!["CANCELLED", "RETURN_REQUESTED", "RETURNED"].includes(order.status) && (
                  isDelivered ? (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "RETURN_REQUESTED")}
                      className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 uppercase">Return items</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                      className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 uppercase">Cancel items</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  )
                )}

                <button className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 uppercase">NEED HELP WITH ORDER ?</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Order Total */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-xl rounded-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 uppercase">Order Summary</h3>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">
                    TOTAL ({items.length} items):
                  </span>
                  <span className="font-semibold text-lg text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>
            </div>


            {/* Payment Method */}
            <div className="bg-white shadow-xl rounded-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center uppercase">
                <CreditCard className="w-5 h-5 mr-2 uppercase" />
                Payment Method
              </h3>
              <p className="text-gray-700 font-medium uppercase">
                {order.paymentMethod === 'card' ? 'Paid via Card' : 'Cash on Delivery'}
              </p>
            </div>



          </div>
        </div>
      </div>

    </div>
  );
}
