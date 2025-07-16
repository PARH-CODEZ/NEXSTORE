'use client';
import React, { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, Heart, Share2, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import CategoryNav from '../components/Categories/Categories';
import EmptyCartContainer from '../components/EmptyCartContainer/EmptyCart';

export default function ShoppingCart() {
    const user = useSelector((state) => state.user.user);
    const [cartItems, setCartItems] = useState([]);
    const [empty, setEmpty] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            setEmpty(true);
            return;
        }

        const fetchCart = async () => {
            try {

                setLoading(true)
                const res = await fetch('/api/cart', {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await res.json();
                if (!res.ok || !data.items || data.items.length === 0) {
                    setEmpty(true);
                } else {
                    setCartItems(data.items);
                    const qtyMap = {};
                    const selectedMap = {};
                    data.items.forEach((item) => {
                        qtyMap[item.id] = item.quantity;
                        selectedMap[item.id] = true;
                    });
                    setQuantities(qtyMap);
                    setSelected(selectedMap);
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setEmpty(true);
            }
        };

        fetchCart();
    }, [user]);

    const updateQuantity = (id, change) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + change),
        }));
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);

    const getDiscountedPrice = (price, discountPercent) =>
        Math.round(price * (1 - discountPercent / 100));

    const subtotal = cartItems.reduce((sum, item) => {
        const qty = quantities[item.id] || 1;
        const discounted = getDiscountedPrice(item.variant.product.price, item.variant.product.discountPercent);
        return sum + qty * discounted;
    }, 0);

    if (empty) return <EmptyCartContainer />;

    return (
        <div className="overflow-x-hidden bg-gray-100">
            <Navbar />
            <CategoryNav />
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] space-y-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-sm text-gray-600">LOADING...</div>
                    </div>


                ) : (
                    <>

                        <div className="xl:max-w-[80%] mx-auto p-4  min-h-screen">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Cart Section */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-sm shadow-md p-6 mb-6 ">
                                        <div className="flex items-center justify-between mb-8 border-b border-grey-700 pb-10 ">
                                            <h1 className="text-2xl font-semibold text-gray-700 uppercase">Shopping Cart</h1>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm uppercase">Deselect all items</button>
                                        </div>

                                        {cartItems.map((item) => {
                                            const product = item.variant.product;
                                            const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
                                            const qty = quantities[item.id] || 1;

                                            return (
                                                <div key={item.id} className="border-b border-gray-200 pb-6 mb-6">
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected[item.id]}
                                                                onChange={(e) =>
                                                                    setSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))
                                                                }
                                                                className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <img
                                                                src={item.variant.images?.[0]?.imageUrl || '/placeholder.jpg'}
                                                                alt={product.name}
                                                                className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-gray-100 rounded-lg"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase">
                                                                {product.name}
                                                            </h3>

                                                            <div className="text-sm text-green-600 font-medium mb-2 uppercase">In stock</div>

                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                                <span className="text-sm text-gray-600 uppercase">
                                                                    Variant: {item.variant.valueSummary || 'Default'}
                                                                </span>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, -1)}
                                                                        className="p-2 hover:bg-gray-100 rounded-l-md"
                                                                        disabled={qty <= 1}
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="px-4 py-2 border-x border-gray-300 min-w-12 text-center">
                                                                        {qty}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, 1)}
                                                                        className="p-2 hover:bg-gray-100 rounded-r-md"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                                                                    <Trash2 className="w-4 h-4 uppercase" />
                                                                    DELETE
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-red-600 text-xl font-semibold mb-1">
                                                                {formatPrice(discountedPrice)}
                                                            </div>
                                                            <div className="text-sm text-gray-500 line-through">
                                                                M.R.P.: {formatPrice(product.price)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Subtotal */}
                                        <div className="pt-4 text-right">
                                            <span className="text-xl font-semibold">
                                                TOTAL ({cartItems.length} items): {formatPrice(subtotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-sm shadow-md p-6 sticky top-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <span className="text-green-600 font-medium text-sm uppercase">
                                                Your order is eligible for FREE Delivery.
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 uppercase">
                                            Choose <button className="text-blue-600 ">FREE DELIVERY</button> option at checkout.
                                        </p>

                                        <div className="text-xl font-semibold mb-4">
                                            SUBTOTAL ({cartItems.length} items): {formatPrice(subtotal)}
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <input type="checkbox" className="w-4 h-4" />
                                            <span className="text-xs text-gray-600 uppercase">This order contains a gift</span>
                                        </div>

                                        <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg mb-4">
                                            PROCEED TO BUY
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>

                )
            }



        </div>
    );
}
