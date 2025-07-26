'use client';
import React, { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, Heart, Share2, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import CategoryNav from '../components/Categories/Categories';
import EmptyCartContainer from '../components/EmptyCartContainer/EmptyCart';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ShoppingCart() {
    const router = useRouter()
    const user = useSelector((state) => state.user.user);
    const [cartItems, setCartItems] = useState([]);
    const [empty, setEmpty] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(false)



    useEffect(() => {
        const localItems = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
        console.log('Selected Items from localStorage:', localItems);
    }, [selected]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/cart', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await res.json();
            if (!res.ok || !data.items || data.items.length === 0) {
                setEmpty(true);
                localStorage.removeItem('checkoutItems');
            } else {
                console.log(data)
                setCartItems(data.items);

                // ✅ Create selected map
                const qtyMap = {};
                const selectedMap = {};
                data.items.forEach((item) => {
                    qtyMap[item.id] = item.quantity;
                    selectedMap[item.id] = true; // default: selected
                });
                setQuantities(qtyMap);
                setSelected(selectedMap);

                // ✅ Filter selected items
                const selectedItems = data.items.filter((item) => selectedMap[item.id]);
                localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));

                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setEmpty(true);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            setEmpty(true);
            return;
        }


        fetchCart();
    }, [user]);

    const handleProceedToBuy = () => {
        const selectedItems = cartItems.filter((item) => selected[item.id]);

        if (selectedItems.length === 0) {
            toast.info("PLEASE SELECT AT LEAST ONE ITEM.");
            return;
        }

        localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
        localStorage.setItem("checkoutSource", "cart");

        router.push("/checkout");
    };

    const updateQuantity = async (itemId, change) => {
        const newQty = Math.max(1, (quantities[itemId] || 1) + change);

        if (newQty === quantities[itemId]) return; // silently prevent if no actual change
        try {
            const res = await fetch('/api/cart/update', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId,
                    quantity: newQty,
                }),
            });

            const data = await res.json();

            if (res.status === 400) {
                toast.error(data?.error)
                return
            }

            if (!res.ok) {
                console.error('Failed to update quantity:', data?.error);
                // Optionally revert local state or show toast
            }
            fetchCart()

        } catch (err) {
            console.error('Error updating quantity:', err);
            // Optionally revert local state
        }
    };


    const deleteCartItem = async (itemId) => {
        try {
            const res = await fetch('/api/cart/delete', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            });

            if (res.ok) {
                setCartItems((prev) => prev.filter((item) => item.id !== itemId));
                fetchCart()
            } else {
                const errData = await res.json();
                console.error('Failed to delete:', errData);
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const deselectAll = () => {
        setSelected({})
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
                                <div className="lg:col-span-2 order-2 lg:order-1 ">
                                    <div className="bg-white rounded-sm shadow-md p-6 mb-6 ">
                                        <div className="flex items-center justify-between mb-8 border-b border-grey-500 pb-10 ">
                                            <h1 className="text-xl font-semibold text-gray-700 uppercase">Shopping Cart</h1>
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm uppercase"
                                                onClick={deselectAll} // ✅ This is correct
                                            >
                                                Deselect all items
                                            </button>

                                        </div>

                                        {cartItems.map((item) => {
                                            const product = item.variant.product;
                                            const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
                                            const qty = quantities[item.id] || 1;

                                            return (
                                                <div key={item.id} className="border-b border-gray-200 pb-6 mb-6">
                                                    <div className="flex flex-row sm:flex-row gap-4">
                                                        <div className="flex md:items-start gap-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!selected[item.id]}
                                                                onChange={(e) => {
                                                                    const newSelected = {
                                                                        ...selected,
                                                                        [item.id]: e.target.checked,
                                                                    };
                                                                    setSelected(newSelected);

                                                                    // ✅ Store only selected items in localStorage
                                                                    const selectedItems = cartItems.filter((cartItem) => newSelected[cartItem.id]);
                                                                    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
                                                                }}
                                                                className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />


                                                            <img
                                                                src={item.variant.images?.[0]?.imageUrl || '/placeholder.jpg'}
                                                                alt={product.name}
                                                                className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-gray-100 rounded-lg"
                                                                onClick={() => router.push(`/products/${item.variant.product.id}`)}
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase cursor-pointer " onClick={() => router.push(`/products/${item.variant.product.id}`)}>
                                                                {product.name}
                                                            </h3>

                                                            <div className="text-sm text-green-600 font-medium mb-2 uppercase">In stock</div>

                                                            <div className="md:hidden">
                                                                <div className="text-red-600 text-xl font-semibold mb-1">
                                                                    {formatPrice(
                                                                        Number(discountedPrice ?? product.price) + Number(item.variant?.additionalPrice ?? 0)
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500 line-through">
                                                                    M.R.P.:{" "}
                                                                    {formatPrice(
                                                                        Number(product.price) + Number(item.variant?.additionalPrice ?? 0)
                                                                    )}
                                                                </div>

                                                            </div>

                                                            <span className="text-sm text-gray-600 uppercase mb-8">
                                                                Variant: {item.variant.variantName || 'Default'}
                                                            </span>


                                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, -1)}
                                                                        className="p-2 hover:bg-gray-100 rounded-l-md"
                                                                        disabled={quantities[item.id] <= 1}
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

                                                                <button
                                                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                                    onClick={() => deleteCartItem(item.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 uppercase" />
                                                                    DELETE
                                                                </button>

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
                                                                {formatPrice(
                                                                    Number(product.price) + Number(item.variant?.additionalPrice ?? 0)
                                                                )}
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
                                <div className="lg:col-span-1 order-1 lg:order-2 ">
                                    <div className="bg-white rounded-sm shadow-md p-6 sticky top-4">
                                        {subtotal > 200 && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <Check className="w-5 h-5 text-green-600" />
                                                <span className="text-green-600 font-medium text-sm uppercase">
                                                    Your order is eligible for FREE Delivery.
                                                </span>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600 mb-4 uppercase">
                                            Choose <button className="text-blue-600 ">FREE DELIVERY</button> option at checkout.
                                        </p>

                                        <div className="text-xl font-semibold mb-4">
                                            SUBTOTAL ({cartItems.length} ITEMS): {formatPrice(subtotal)}
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <input type="checkbox" className="w-4 h-4" />
                                            <span className="text-xs text-gray-600 uppercase">This order contains a gift</span>
                                        </div>

                                        <button
                                            onClick={handleProceedToBuy}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-sm mb-4"
                                        >
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