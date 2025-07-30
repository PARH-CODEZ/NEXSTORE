'use client'
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Phone, MapPin, DollarSign, ArrowUpCircle, ShoppingBag, MoveRight, Loader, } from "lucide-react";
import CategoryNav from '../components/Categories/Categories';
import Navbar from '../components/Navbar/Navbar';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/sellerorders?page=${currentPage}&limit=${itemsPerPage}`, {
          credentials: 'include',
        });

        const data = await res.json();
        console.log("Fetched data:", data);

        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');

        setOrders(data.orders);               
        setFilteredOrders(data.orders);      
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage]);


  useEffect(() => {
    let filtered = orders || [];

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();

      filtered = filtered.filter(order => {
        const orderId = String(order?.id || '').toLowerCase(); 
        const customerName = order?.customerName?.toLowerCase() || '';

        const productText = order.products
          ?.map(p => `${p.title} ${p.variantName}`.toLowerCase())
          .join(' ') || '';

        return (
          orderId.includes(searchLower) ||
          customerName.includes(searchLower) ||
          productText.includes(searchLower)
        );
      });
    }



    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order?.status === statusFilter);
    }

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      if (!isNaN(days)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filtered = filtered.filter(order => {
          const orderDate = order?.orderDate;
          if (!orderDate) return false;
          return new Date(orderDate) >= cutoffDate;
        });
      }
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter, dateRange]);



  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "CONFIRMED":
        return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case "PACKED":
        return <Package className="w-4 h-4 text-indigo-500" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "OUT_FOR_DELIVERY":
        return <MoveRight className="w-4 h-4 text-blue-600" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "RETURN_REQUESTED":
        return <ArrowUpCircle className="w-4 h-4 text-orange-500" />;
      case "RETURNED":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PACKED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "RETURN_REQUESTED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "RETURNED":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };


  function getPaymentStatusIcon(status) {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'REFUNDED':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Loader className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  }



  function getPaymentStatusColor(status) {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  const handleSelectAll = () => {
    const currentPageOrders = getCurrentPageOrders();
    if (!currentPageOrders?.length) return;

    const allSelected = currentPageOrders.every(order => order?.id && selectedOrders.includes(order.id));

    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !currentPageOrders.map(o => o?.id).includes(id)));
    } else {
      const validIds = currentPageOrders.map(o => o?.id).filter(Boolean);
      setSelectedOrders(prev => [...new Set([...prev, ...validIds])]);
    }
  };

  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return (filteredOrders || []).slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Optimistically update UI
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Send request to backend
      const res = await fetch(`/api/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ this sends cookies along with the request
        body: JSON.stringify({
          status: newStatus,
        }),
      });


      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      console.log('Status updated:', data.order);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally revert UI update or show toast here
    }
  };



  if (loading) return (<FullScreenLoader />)

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{order.orderDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg">${order.amount}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Product Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {order.products?.length > 0 ? (
                      order.products.map((product, index) => (
                        <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Product:</span>
                            <span className="font-medium text-gray-900">{product.title}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Variant:</span>
                            <span className="text-gray-700">{product.variantName}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic uppercase">No products found</div>
                    )}
                    <div className="flex justify-between text-sm pt-3 mt-2 border-t border-gray-300">
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-medium text-gray-900">{order.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-600">Customer</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{order.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span className="text-sm">{order.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Actions</h3>
                  <div className="space-y-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PACKED">Packed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="RETURN_REQUESTED">Return Requested</option>
                      <option value="RETURNED">Returned</option>

                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      <div className='w-full hidden md:block'>
        <CategoryNav />
      </div>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className=" border-b border-gray-200 uppercase">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-1 text-sm">Manage and track all your orders</p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase">Export</span>
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase">Bulk Actions</span>
                </button>
              </div>
            </div>
          </div>
        </div>



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Filters and Search */}
          <div className="bg-white rounded-sm border border-gray-800 py-2 mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search orders, customers, or products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURN_REQUESTED">Return Requested</option>
                    <option value="RETURNED">Returned</option>

                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-[30px]">
            {[
              {
                title: 'TOTAL ORDERS',
                value: orders.length,
                Icon: Package,
                bgFrom: 'from-blue-100',
                bgTo: 'to-blue-200',
              },
              {
                title: 'PENDING',
                value: orders.filter((o) => o.status === 'PENDING').length,
                Icon: Clock,
                bgFrom: 'from-yellow-100',
                bgTo: 'to-yellow-200',
              },
              {
                title: 'SHIPPED',
                value: orders.filter((o) => o.status === 'SHIPPED').length,
                Icon: Truck,
                bgFrom: 'from-purple-100',
                bgTo: 'to-purple-200',
              },
              {
                title: 'REVENUE',
                value: `$${orders.reduce((sum, o) => sum + parseFloat(o.amount), 0).toFixed(2)}`,
                Icon: DollarSign,
                bgFrom: 'from-green-100',
                bgTo: 'to-green-200',
              },
            ].map((stat, i) => (
              <StatCard
                key={i}
                title={stat.title}
                value={stat.value}
                Icon={stat.Icon}
                bgFrom={stat.bgFrom}
                bgTo={stat.bgTo}
              />
            ))}
          </div>




          {/* Orders Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={getCurrentPageOrders().length > 0 && getCurrentPageOrders().every(order => selectedOrders.includes(order.id))}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentPageOrders()?.map((order) => {
                    if (!order) return null;

                    return (
                      <tr key={order?.id || Math.random()} className={`hover:bg-gray-50 ${selectedOrders.includes(order?.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order?.id)}
                            onChange={() => handleOrderSelect(order?.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order?.id || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                              {(order?.customerName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order?.customerName || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{order?.phone || 'No Phone'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {order.products?.length > 0 ? (
                            <div className="space-y-2">
                              {order.products.map((product, index) => (
                                <div
                                  key={index}
                                  className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {product.title || "Unknown Product"}
                                      </h4>
                                      <div className="mt-1">
                                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                          {product.variantName || "Default Variant"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic text-center py-4">
                              No products found
                            </div>
                          )}
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order?.paymentStatus)}`}
                          >
                            {getPaymentStatusIcon(order?.paymentStatus)}
                            <span className="ml-1 capitalize">{order?.paymentStatus || 'Unknown'}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${order?.amount || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order?.orderDate || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <select
                              value={order?.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order?.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PACKED">Packed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="RETURN_REQUESTED">Return Requested</option>
                              <option value="RETURNED">Returned</option>


                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div> </div>

  );
};

export default OrderManagement;



function StatCard({ title, value, Icon, bgFrom, bgTo }) {
  return (
    <div className={`rounded-sm p-6 bg-gradient-to-br ${bgFrom} ${bgTo} shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-full shadow">
          <Icon className="w-6 h-6 text-gray-800" />
        </div>
      </div>
    </div>
  );
}