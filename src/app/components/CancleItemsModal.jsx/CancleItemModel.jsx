"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CancelItemsModal({ isOpen, onClose, orderId, items, onUpdate }) {
    const [loadingIds, setLoadingIds] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleCancelItem = async (itemId) => {
        setLoadingIds((prev) => [...prev, itemId]);
        console.log(itemId)
        console.log(orderId)
        try {
            await fetch('/api/order/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, orderItemId: itemId }),
            });


            onUpdate()
        } catch (err) {
            console.error("Cancel failed", err);
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== itemId));
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);

    const getDiscountedPrice = (price, discountPercent) =>
        Math.round(price * (1 - discountPercent / 100));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 px-2 sm:px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 uppercase">
                    Cancel Items
                </h2>

                {items.map((item) => {
                    const product = item.variant.product;
                    const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
                    const finalPrice =
                        Number(discountedPrice ?? product.price) + Number(item.variant?.additionalPrice ?? 0);

                    return (
                        <div key={item.id} className="border-b border-gray-200 pb-6 mb-6">
                            <div className="flex flex-row gap-4">
                                <img
                                    src={item.variant.images?.[0]?.imageUrl || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain bg-gray-100 rounded-lg shrink-0"
                                />

                                <div className="flex-1">
                                    <h3
                                        className="text-base font-medium text-gray-900 mb-1 uppercase cursor-pointer"
                                        onClick={() => router.push(`/products/${item.variant.productId}`)}
                                    >
                                        {product.name}
                                    </h3>

                                    <p className="text-sm uppercase text-gray-600 mb-1">
                                        Variant: {item.variant.variantName}
                                    </p>

                                    <p className="text-sm text-gray-600 mb-1">QTY: {item.quantity}</p>

                                    <div className="text-red-600 font-semibold text-base mb-1">
                                        {formatPrice(finalPrice)}
                                    </div>
                                    <div className="text-sm text-gray-500 line-through">
                                        M.R.P:{" "}
                                        {formatPrice(
                                            Number(product.price) + Number(item.variant?.additionalPrice ?? 0)
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <button
                                        onClick={() => handleCancelItem(item.id)}
                                        disabled={loadingIds.includes(item.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition uppercase"
                                    >
                                        {loadingIds.includes(item.id) ? "Cancelling..." : "Cancel"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
