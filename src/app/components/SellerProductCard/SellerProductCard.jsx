'use client';

import { Star, StarHalf, Trash2, XCircle, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ProductCard = ({ products = [], onUpdate }) => {
    const router = useRouter();

    const renderStars = (rating) => {
        const stars = [];
        const full = Math.floor(rating);
        const hasHalf = rating % 1 !== 0;

        for (let i = 0; i < full; i++) {
            stars.push(<Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />);
        }
        if (hasHalf) {
            stars.push(<StarHalf key="half" className="w-4 h-4 fill-orange-400 text-orange-400" />);
        }
        for (let i = 0; i < 5 - Math.ceil(rating); i++) {
            stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
        }
        return stars;
    };

    const formatPrice = (price = 0) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);

    const getProductImage = (p) =>
        p.images?.[0]?.imageUrl || p.variants?.[0]?.images?.[0]?.imageUrl || '/placeholder.jpg';

    const getDiscountedPrice = (price, discount) => {
        if (!discount || discount <= 0) return price;
        return Math.round(price * (1 - discount / 100));
    };

    const getAvgRating = (reviews = []) => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
    };
    const handleOutOfStock = (id) => updateStockStatus(id, false);
    const handleBackInStock = (id) => updateStockStatus(id, true);

    const updateStockStatus = async (productId, inStock) => {
        try {
            const res = await fetch('/api/products/stock', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',           // sends auth cookies
                body: JSON.stringify({
                    productId: Number(productId),
                    stockAvailable: Boolean(inStock),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            onUpdate?.()
        } catch (err) {
            console.error('Stock update error:', err);
            alert('Error updating product stock status');
        }
    };


    const handleDelete = async (productId) => {
        if (!confirm('CONFIRM DELETE PRODUCT ?')) return;
        try {
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            onUpdate?.()
        } catch (err) {
            console.error(err);
            alert('Error deleting product');
        }
    };

    return (
        <div className="space-y-4">
            {products.map((p, index) => {
                const avgRating = getAvgRating(p.reviews || []);
                const reviewCount = p._count?.reviews || 0;
                const discountedPrice = getDiscountedPrice(p.price, p.discountPercent);
                const sales = p.sales || p.totalSales || 0;
                const revenue = sales * discountedPrice;

                return (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden w-full hover:shadow-sm transition"
                        onClick={() => router.push(`/products/${p.id}`)}
                    >
                        <div className="p-4 flex flex-col lg:flex-row gap-4">
                            <img
                                src={getProductImage(p)}
                                alt={p.name}
                                className="w-40 h-40 object-contain mx-auto lg:mx-0"
                            />

                            <div className="flex-1 ">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900 mb-1 uppercase line-clamp-2 max-w-[80%]">
                                        {p.name}
                                    </h3>

                                    {/* Desktop Buttons */}
                                    <div className="hidden lg:flex gap-2">
                                        {p.isApproved === false ? (
                                            <span className="flex-1 w-[160px] flex items-center justify-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-3 rounded uppercase cursor-not-allowed">
                                                <Clock className="w-4 h-4" />
                                                Approval Pending
                                            </span>
                                        ) : p.stockAvailable === false ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBackInStock(p.id);
                                                }}
                                                className="flex-1 w-[160px] flex items-center justify-center gap-1 truncate text-xs bg-green-100 text-green-800 px-2 py-3 rounded uppercase cursor-pointer"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Back in Stock
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOutOfStock(p.id);
                                                }}
                                                className="flex-1 w-[160px] flex items-center justify-center gap-1 truncate text-xs bg-yellow-100 text-yellow-800 px-2 py-3 rounded uppercase cursor-pointer"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Mark unavailable
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(p.id);
                                            }}
                                            className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-2 rounded uppercase cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-2 uppercase">
                                    CATEGORY: <span className="font-medium">{p.category?.Slug || 'N/A'}</span>
                                </p>

                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex">{renderStars(avgRating)}</div>
                                    <span className="text-sm text-blue-600">({reviewCount})</span>
                                </div>

                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xl font-semibold text-gray-900">
                                        {formatPrice(discountedPrice)}
                                    </span>
                                    <span className="line-through text-gray-500 text-sm">
                                        {formatPrice(p.mrp || p.price)}
                                    </span>
                                    <span className="text-sm text-green-600">
                                        ({Math.round(p.discountPercent || 0)}% off)
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs mt-3">
                                    <div className="border border-gray-300 bg-gray-100 px-2 py-1">
                                        SALES: <span className="font-semibold">{p.unitsSold}</span>
                                    </div>
                                    <div className="border border-gray-300 bg-gray-100 px-2 py-1">
                                        REVENUE: <span className="font-semibold">{formatPrice(p.revenue)}</span>
                                    </div>
                                    <div className="border border-gray-300 bg-gray-100 px-2 py-1">
                                        CREATED: <span className="font-semibold">
                                            {new Date(p.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="border border-gray-300 bg-gray-100 px-2 py-1">
                                        UPDATED: <span className="font-semibold">
                                            {new Date(p.updatedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>




                                {/* Mobile Buttons */}
                                <div className="flex lg:hidden gap-3 mt-4">
                                    {p.isApproved === false ? (
                                        <span className="flex-1 flex items-center justify-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-3 rounded uppercase cursor-not-allowed">
                                            <Clock className="w-4 h-4" />
                                            Pending
                                        </span>
                                    ) : p.stockAvailable === false ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBackInStock(p.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-3 rounded uppercase cursor-pointer"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark in Stock
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOutOfStock(p.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-3 rounded uppercase cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            mark unavailable
                                        </button>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(p.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-3 rounded uppercase cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}





// ✅ ProductGrid wrapper - receives products from parent
const SellerProductGrid = ({ products = [], onUpdate }) => {
    return (
        <div className="xl:w-[100%] border-t border-gray-300 mt-7 pt-6">
            <ProductCard products={products} onUpdate={onUpdate} />
        </div>
    );
};

export default SellerProductGrid;
