'use client'
import React, { useState, useEffect } from 'react';
import { ChevronDown, CreditCard, Building, Smartphone, Calendar, Truck, HelpCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { loadStripe } from '@stripe/stripe-js';

const CheckoutUI = () => {

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    const router = useRouter();
    const user = useSelector((state) => state.user.user)
    const [items, setItems] = useState([]);
    const [empty, setEmpty] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);


    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

    })


    useEffect(() => {

        return () => {
            localStorage.removeItem('checkoutItems');
            localStorage.removeItem('buyNowItems')
        };
    }, []);



    useEffect(() => {


        const buyNowData = localStorage.getItem('buyNowItems');
        const checkoutData = localStorage.getItem('checkoutItems');

        let parsed = [];

        if (buyNowData) {
            parsed = JSON.parse(buyNowData);
            console.log('Loaded Buy Now item:', parsed);
        } else if (checkoutData) {
            parsed = JSON.parse(checkoutData);
            console.log('Loaded Checkout items from cart:', parsed);
        }

        if (parsed.length) {
            setItems(parsed);

            const qtyMap = {};
            const selectedMap = {};

            parsed.forEach((item) => {
                qtyMap[item.id] = item.quantity || 1;
                selectedMap[item.id] = true;
            });

            setQuantities(qtyMap);
            setSelected(selectedMap);
        }
    }, []);



    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/address/list', { credentials: 'include' });
            const data = await res.json();

            if (res.ok) {
                if (data.addresses?.length > 0) {
                    setAddresses(data.addresses);
                } else {
                    toast('PLEASE ADD ADDRESS FIRST');
                    router.push('/account');
                }
            } else {
                console.error(data.error || 'Failed to load addresses');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {


        if (user) {

            fetchAddresses();
        }

    }, []);



    const updateQuantity = (itemId, change) => {
        setQuantities((prev) => {
            const newQty = (prev[itemId] || 1) + change;
            if (newQty < 1 || newQty > 10) return prev;

            const updated = { ...prev, [itemId]: newQty };

            // update items too
            const updatedItems = items.map((item) =>
                item.id === itemId ? { ...item, quantity: newQty } : item
            );
            setItems(updatedItems);
            localStorage.setItem("checkoutItems", JSON.stringify(updatedItems));

            return updated;
        });
    };



    useEffect(() => {
        // Pre-select default address
        const defaultAddr = addresses.find(addr => addr.IsDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
    }, [addresses]);

    const handleChange = (address) => {
        setSelectedAddress(address);
    };


    const paymentMethods = [
        { id: 'card', label: 'Credit or debit card', icon: CreditCard },
        { id: 'cod', label: 'Cash on Delivery / Pay on Delivery', icon: Truck },
    ];




    const handlePayment = async () => {
        setLoading(true)
        const selectedItems = items.filter((item) => selected[item.id]);

        console.log('Checkout Items:', selectedItems);
        console.log('Selected Address:', selectedAddress);

        if (selectedItems.length === 0) {
            toast.error("Please select at least one item to proceed.");
            return;
        }

        if (!selectedAddress) {
            toast.error("Please select a delivery address.");
            return;
        }

        // Cash on Delivery (COD) logic
        if (selectedPayment === 'cod') {
            try {
                const res = await fetch('/api/checkout/cod', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: selectedItems,
                        addressId: selectedAddress.AddressID,
                    }),
                });

                if (res.ok) {
                    alert('Order placed with Cash on Delivery!');
                    localStorage.removeItem("checkoutItems");
                    localStorage.removeItem("checkoutSource");
                    router.push("/orders");
                } else {
                    throw new Error('COD Order Failed');
                }
            } catch (err) {
                console.error(err);
                alert('COD Failed!');
            }
            return;
        }

        // Stripe Checkout logic
        try {
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("Stripe failed to load.");
            }

            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: selectedItems,
                    addressId: selectedAddress.AddressID,
                    userId: user?.id, // optional if you want to track user
                }),
            });

            const { sessionId } = await res.json();
            console.log("Stripe Session ID:", sessionId);


            const result = await stripe.redirectToCheckout({ sessionId });

            if (result.error) {
                console.error(result.error.message);
                toast.error("Stripe redirect failed");
            }
        } catch (err) {
            console.error(err);
            alert('Payment Failed!');
        } finally {
            setLoading(false);
        }

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

    const subtotal = items.reduce((sum, item) => {
        const qty = quantities[item.id] || 1;
        const price = Number(item.variant.product.price);
        const discount = Number(item.variant.product.discountPercent || 0);
        const additional = Number(item.variant.additionalPrice || 0);

        const discounted = getDiscountedPrice(price, discount);
        const finalPrice = discounted + additional;

        return sum + qty * finalPrice;
    }, 0);


    const DELIVERY_CHARGE = 40;
    const isEligibleForFreeDelivery = subtotal >= 400;
    const deliveryCharge = isEligibleForFreeDelivery ? 0 : DELIVERY_CHARGE;
    const finalTotal = subtotal + deliveryCharge;

    const updatedPaymentMethods = paymentMethods.map((method) => {
        if (method.id === 'cod') {
            return { ...method, disabled: subtotal > 10000 };
        }
        return { ...method, disabled: false };
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-[#0D0D0D] text-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold uppercase">nexstore</h1>
                        </div>
                        <div className="flex items-center">
                            <button className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                                <HelpCircle className="h-5 w-5" />
                                <span className="text-sm font-medium uppercase">Help</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-gray-800 uppercase">Delivering to {user?.name}</h2>

                                    {addresses.map((address) => (
                                        <label
                                            key={address.AddressID}
                                            className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-md border cursor-pointer transition ${selectedAddress?.AddressID === address.AddressID
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="selectedAddress"
                                                    checked={selectedAddress?.AddressID === address.AddressID}
                                                    onChange={() => handleChange(address)}
                                                    className="mt-1 accent-blue-600"
                                                />

                                                <div>
                                                    <p className="text-sm text-gray-700 leading-relaxed uppercase">
                                                        {address.AddressLine1}, {address.AddressLine2 && `${address.AddressLine2}, `}
                                                        {address.City}, {address.State}, {address.PostalCode}, {address.Country}
                                                    </p>
                                                    {address.IsDefault && (
                                                        <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                        </label>
                                    ))}
                                </div>

                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-8 uppercase">
                                    Add delivery instructions
                                </button>
                            </div>

                            <div className="lg:col-span-2 order-2 lg:order-1 ">
                                <div className="bg-white rounded-sm shadow-md p-6 mb-6 ">
                                    <div className="flex items-center justify-between mb-8 border-b border-grey-500 pb-10 ">
                                        <h1 className="text-xl font-semibold text-gray-700 uppercase">Review items</h1>
                                    </div>

                                    {items.map((item) => {
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
                                                                const selectedItems = items.filter((cartItem) => newSelected[cartItem.id]);
                                                                localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
                                                            }}
                                                            className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />


                                                        <img
                                                            src={item.variant.images?.[0]?.imageUrl || '/placeholder.jpg'}
                                                            alt={product.name}
                                                            className="w-32 h-32 sm:w-40 sm:h-40 object-contain bg-gray-100 rounded-lg"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase cursor-pointer " onClick={() => router.push(`/products/${item.variant.productId}`)}>
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


                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                            <span className="text-sm text-gray-600 uppercase">
                                                                Variant: {item.variant.variantName}
                                                            </span>
                                                        </div>

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
                                        <span className="text-md font-semibold">
                                            TOTAL ({items.length} items): {formatPrice(subtotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>









                            <div className="bg-white rounded-lg shadow-sm p-6 uppercase">
                                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment method</h2>
                                <div className="space-y-3 mb-6">
                                    {updatedPaymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => !method.disabled && setSelectedPayment(method.id)}
                                            className={`flex items-center gap-2 w-full px-4 py-2 rounded-md border uppercase text-left 
                                            ${selectedPayment === method.id ? 'border-yellow-500 bg-yellow-100' : 'border-gray-300'} 
                                             ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={method.disabled}
                                        >
                                            {method.icon && <method.icon size={18} />} {method.label}
                                            {method.id === 'cod' && method.disabled && (
                                                <span className="text-xs text-red-500 ml-2">(Unavailable above ₹10,000)</span>
                                            )}
                                        </button>
                                    ))}

                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className={`relative w-full sm:w-auto px-6 py-3 rounded-md transition-colors font-medium uppercase flex items-center justify-center
    ${loading ? 'bg-yellow-300 text-gray-700 cursor-not-allowed' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'}`}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2 text-gray-700"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>
                                            {selectedPayment === 'cod' ? 'Placing Order...' : 'Processing...'}
                                        </>
                                    ) : (
                                        selectedPayment === 'cod' ? 'Place Order (COD)' : 'Pay with Stripe'
                                    )}
                                </button>

                            </div>
                        </div>

                        <div className="lg:col-span-1 uppercase">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className={`w-full mb-6 px-6 py-3 rounded-md transition-colors font-medium uppercase flex items-center justify-center
                                   ${loading ? 'bg-yellow-300 text-gray-700 cursor-not-allowed' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'}`}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2 text-gray-700"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>
                                            {selectedPayment === 'cod' ? 'Placing Order...' : 'Processing...'}
                                        </>
                                    ) : (
                                        selectedPayment === 'cod' ? 'Place Order (COD)' : 'Pay with Stripe'
                                    )}
                                </button>


                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items:</span>
                                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery:</span>
                                        <span className="text-gray-900">{subtotal > 400 ? '₹0.00' : '₹40.00'}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="text-gray-900">{formatPrice(subtotal + (subtotal > 400 ? 0 : 40))}</span>
                                    </div>

                                    {subtotal > 400 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Promotion Applied:</span>
                                            <span className="text-red-600">-₹40.00</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-3 mt-3">
                                        <div className="flex justify-between font-medium text-lg">
                                            <span className="text-gray-900">Order Total:</span>
                                            <span className="text-red-600">{formatPrice(subtotal + (subtotal > 400 ? 0 : 40))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <footer className=" w-full  bg-[#131A22] text-white py-6 px-6 mt-8">
                <div className="max-w-6xl mx-auto">
                    <a href="#" className="block text-center text-sm mb-6 hover:underline text-gray-400 uppercase">
                        Back To Top
                    </a>
                    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
                        <div className="mb-4 md:mb-0">
                            <span className="text-white font-medium  uppercase">nexstore</span>
                        </div>
                        <div>
                            <a href="#" className="hover:underline uppercase">Help</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CheckoutUI;
