'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import CategoryNav from '../components/Categories/Categories'
import { useSelector } from 'react-redux'
import EmptyCartContainer from '../components/EmptyCartContainer/EmptyCart'
import EmptyOrdersContainer from '../components/EmptyOrderContainer/EmptyOrder'
import { Package, Truck, CheckCircle, Clock, Search, Filter, ChevronDown, Star, ArrowRight, XCircle, Undo, RefreshCcw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'

const page = () => {
    const router = useRouter();
    const user = useSelector((state) => state.user.user);
    const [empty, setEmpty] = useState(false)

    useEffect(() => {
        if (!user || user.role != 'customer') {
            setEmpty(true)
        }
    }, [user])

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState()
    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                console.log(data)
                setOrders(data);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);


    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredOrders = Array.isArray(orders)
        ? orders.filter(order => {
            const matchesSearch = order.items.some(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) || order.id.includes(searchTerm);

            const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

            return matchesSearch && matchesStatus;
        })
        : [];

    // Add this function at the top of your component (after the imports, before the component)
    const getStatusStyles = (status) => {
        const styles = {
            PENDING: "bg-gray-100 text-gray-800 border-gray-200",
            CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
            PACKED: "bg-yellow-100 text-yellow-800 border-yellow-200",
            SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
            OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 border-orange-200",
            DELIVERED: "bg-green-100 text-green-800 border-green-200",
            CANCELLED: "bg-red-100 text-red-800 border-red-200",
            RETURN_REQUESTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
            RETURNED: "bg-green-50 text-green-700 border-green-200"
        };
        return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    // Replace your existing statusMeta object with this enhanced version
    const statusMeta = {
        PENDING: {
            label: "Order Pending",
            icon: <Clock className="w-4 h-4" />,
            description: "Your order is being processed"
        },
        CONFIRMED: {
            label: "Order Confirmed",
            icon: <CheckCircle className="w-4 h-4" />,
            description: "Your order has been confirmed"
        },
        PACKED: {
            label: "Order Packed",
            icon: <Package className="w-4 h-4" />,
            description: "Your order is packed and ready to ship"
        },
        SHIPPED: {
            label: "Order Shipped",
            icon: <Truck className="w-4 h-4" />,
            description: "Your order is on the way"
        },
        OUT_FOR_DELIVERY: {
            label: "Out for Delivery",
            icon: <Truck className="w-4 h-4 animate-pulse" />,
            description: "Your order will be delivered today"
        },
        DELIVERED: {
            label: "Delivered",
            icon: <CheckCircle className="w-4 h-4" />,
            description: "Your order has been delivered"
        },
        CANCELLED: {
            label: "Cancelled",
            icon: <XCircle className="w-4 h-4" />,
            description: "Your order has been cancelled"
        },
        RETURN_REQUESTED: {
            label: "Return Requested",
            icon: <RefreshCcw className="w-4 h-4" />,
            description: "Return request is being processed"
        },
        RETURNED: {
            label: "Returned",
            icon: <Undo className="w-4 h-4" />,
            description: "Your order has been returned"
        },
    };


    return (
        <>
            <div className='overflow-x-hidden'>
                <Navbar />
                <div className='w-full hidden md:block'>
                    <CategoryNav />
                </div>
                {empty ? (
                    <EmptyOrdersContainer />
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] space-y-2" >
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-sm text-gray-600">LOADING...</div>
                    </div>


                ) : (

                    <div className="min-h-screen bg-gray-100">
                        {/* Header */}
                        <div className=" max-w-7xl mx-auto ">
                            <div className="max-w-7xl mx-auto psm:px-6 lg:px-8 s">
                                <div className="py-4 px-4">
                                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 uppercase">Your Orders</h1>
                                    <p className="text-sm text-gray-600 mt-1 uppercase">Track packages, review orders, and discover new products</p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            {/* Search and Filters */}
                            <div className="bg-gray-50 rounded-sm shadow-sm p-8 mb-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* Time Filter */}
                                    <div className="relative">
                                        <select
                                            value={timeFilter}
                                            onChange={(e) => setTimeFilter(e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="30days">Last 30 days</option>
                                            <option value="3months">Last 3 months</option>
                                            <option value="6months">Last 6 months</option>
                                            <option value="year">This year</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
                                        {/* Order Header */}
                                        <div className=" px-6 py-4 ">
                                            <div
                                                onClick={() => router.push(`/checkout/success?orderId=${order.id}`)}
                                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 uppercase">
                                                    <div>
                                                        <p className="text-sm text-gray-600">ORDER PLACED</p>
                                                        <p className="font-medium">{formatDate(order.date)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">TOTAL</p>
                                                        <p className="font-medium">${order.total}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">SHIP TO</p>
                                                        <p className="font-medium hover:underline cursor-pointer">{order.customerName}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 sm:mt-0 text-right uppercase">
                                                    <p className="text-sm text-gray-600 mb-1">ORDER # {order.id}</p>
                                                    <div className="flex items-center justify-end gap-2 uppercase">
                                                        <button
                                                            onClick={() => router.push(`/checkout/success?orderId=${order.id}`)}
                                                            className="text-blue-600 hover:underline text-sm uppercase"
                                                        >
                                                            View order details
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button className="text-blue-600 hover:underline text-sm uppercase">Invoice</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        {/* Order Status Summary */}
                                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                {/* Order Status */}
                                                <div className="flex items-center gap-3">
                                                    {/* Status Badge with Icon */}
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusStyles(order.status)}`}>
                                                        <div className="flex items-center justify-center">
                                                            {statusMeta[order.status]?.icon}
                                                        </div>
                                                        <span className="text-sm font-semibold uppercase tracking-wide">
                                                            {statusMeta[order.status]?.label || order.status}
                                                        </span>
                                                    </div>

                                                    {/* Status Description */}
                                                    <div className="hidden sm:block">
                                                        <p className="text-sm text-gray-600 italic">
                                                            {statusMeta[order.status]?.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-3">
                                                    {/* Track Order Button */}
                                                    <button
                                                        onClick={() => router.push(`/checkout/success?orderId=${order.id}`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 uppercase shadow-sm hover:shadow-md"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        Track Order
                                                    </button>

                                                    {/* Additional Actions based on status */}
                                                    {order.status === 'DELIVERED' && (
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 text-sm font-medium rounded-lg transition-all duration-200 uppercase">
                                                            <Star className="w-4 h-4" />
                                                            Rate Order
                                                        </button>
                                                    )}

                                                    {order.status === 'SHIPPED' && (
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-all duration-200 uppercase">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Get Updates
                                                        </button>
                                                    )}

                                                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                                        <button className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-all duration-200 uppercase">
                                                            <XCircle className="w-4 h-4" />
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mobile Status Description */}
                                            <div className="sm:hidden mt-2">
                                                <p className="text-sm text-gray-600 italic">
                                                    {statusMeta[order.status]?.description}
                                                </p>
                                            </div>
                                        </div>



                                        {/* Order Items */}
                                        <div className="px-6 py-4">
                                            <div className="space-y-4">
                                                {order.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-row gap-4 uppercase items-start mb-6"
                                                    >
                                                        {/* Product Image */}
                                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                            {item.image ? (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    width={80}
                                                                    height={80}
                                                                    className="object-contain w-full h-full"
                                                                />
                                                            ) : (
                                                                <Package className="w-8 h-8 text-gray-400" />
                                                            )}
                                                        </div>

                                                        {/* Product Info and Actions */}
                                                        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2 sm:items-center">
                                                            {/* Info */}
                                                            <div className="flex-1">
                                                                <h3
                                                                    onClick={() => router.push(`/products/${item.productId}`)}
                                                                    className="font-medium text-blue-600 hover:underline cursor-pointer line-clamp-2"
                                                                >
                                                                    {item.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 mt-1">{item.variantName}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex items-center">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`w-4 h-4 ${i < Math.floor(item.rating)
                                                                                    ? 'text-yellow-400 fill-current'
                                                                                    : 'text-gray-300'
                                                                                    }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm text-gray-600">({item.rating})</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Qty: {item.quantity} | ₹{item.price}
                                                                </p>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-2 mt-2 sm:mt-0 sm:flex-col sm:items-end">
                                                                <button
                                                                    onClick={() => router.push(`/products/${item.productId}`)}
                                                                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded text-sm font-medium uppercase whitespace-nowrap"
                                                                >
                                                                    Buy it again
                                                                </button>
                                                                {order.status === 'delivered' && (
                                                                    <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-sm font-medium uppercase whitespace-nowrap">
                                                                        Write a review
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}


                                            </div>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="px-6 py-4 bg-gray-50 ">
                                            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                                <button
                                                    onClick={() => router.push(`/checkout/success?orderId=${order.id}`)}
                                                    className="border border-gray-300 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium uppercase">
                                                    MANAGE ORDER
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredOrders.length === 0 && (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2 uppercase">No orders found</h3>
                                    <p className="text-gray-600 uppercase">Try adjusting your search or filters</p>
                                </div>
                            )}


                        </div>
                    </div>

                )}


            </div >

        </>

    )
}

export default page