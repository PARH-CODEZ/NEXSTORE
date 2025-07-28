'use client'
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ShoppingCart, Users, Package, DollarSign, TrendingUp, TrendingDown, Eye, Calendar, Filter, Star } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [paymentStatusData, setPaymentStatusData] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/dashboard?range=${timeRange}');
        const data = await res.json();
        console.log(data)
        setStats(data.stats);
        setSalesData(data.sales);
        setCategoryData(data.result)
        setPaymentStatusData(data.paymentStatusData)
        setTopSellers(data.topSellers)
        setTopProducts(data.productResult)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }

    fetchStats();
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between md:items-center flex-col md:flex-row mb-4 gap-4">
          <div>
            <h1 className=" text-lg md:text-xl font-semibold text-gray-900 uppercase mr-1 ">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1 uppercase">Track your store performance and insights</p>
          </div>
         
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''} `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Total Revenue</p>
              <p className="text-md font-medium text-gray-900">
                ${stats[0]?.value?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                {stats[0]?.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${stats[0]?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stats[0]?.isPositive ? '+' : ''}
                  {stats[0]?.change ?? 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''} `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Total Orders</p>
              <p className="text-md font-medium text-gray-900">
                {stats[1]?.value?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                {stats[1]?.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${stats[1]?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stats[1]?.isPositive ? '+' : ''}
                  {stats[1]?.change ?? 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''} `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Active Customers</p>
              <p className="text-md font-medium text-gray-900">
                {stats[2]?.value?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                {stats[2]?.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${stats[2]?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stats[2]?.isPositive ? '+' : ''}
                  {stats[2]?.change ?? 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''} `}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">Products Sold</p>
              <p className="text-md font-medium text-gray-900">
                {stats[3]?.value?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                {stats[3]?.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${stats[3]?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stats[3]?.isPositive ? '+' : ''}
                  {stats[3]?.change ?? 0}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>


      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">


        {/* Revenue & Orders Chart */}
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase">Revenue & Orders Trend</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              <Area type="monotone" dataKey="orders" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>


      </div>



      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">


        {/* Payment Status trends*/}
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">Payment Status Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={paymentStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="SUCCESS" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
              <Area type="monotone" dataKey="PENDING" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
              <Area type="monotone" dataKey="FAILED" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>



        {/*Top Sellers*/}
        <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 ${loading ? 'skeleton' : ''}`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 uppercase">Top Sellers</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{seller.name}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{seller.totalOrders} orders</span>
                      <span>{seller.totalProducts} products</span>

                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>


      </div>



      {/* Top Products Table */}
      <div className={`bg-white  rounded-xl shadow-sm border border-gray-200 mb-8 ${loading ? 'skeleton' : ''}`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 uppercase">Top Performing Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.sales.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm flex items-center ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(product.growth)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Recent Activity & Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

        {/* Performance Insights */}
        <div className={`bg-white  rounded-xl p-2 shadow-sm border border-gray-200 mb-8 ${loading ? 'skeleton' : ''}`}>
          <h3 className=" text-lg font-semibold text-gray-900 mb-4 uppercase">Performance Insights</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900 uppercase">Strong Performance</h4>
              <p className="text-sm text-gray-600">Electronics category is up 15.7% this month with iPhone 15 Pro leading sales.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-medium text-gray-900 uppercase">Attention Needed</h4>
              <p className="text-sm text-gray-600">Customer acquisition rate has decreased by 2.1%. Consider marketing campaigns.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 uppercase">Opportunity</h4>
              <p className="text-sm text-gray-600">Weekend traffic is 28% higher. Optimize for weekend promotions.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-gray-900 uppercase">Action Required</h4>
              <p className="text-sm text-gray-600">3 products are low in stock. Reorder inventory to avoid stockouts.</p>
            </div>
          </div>
        </div>

      </div>



    </div >
  );
};

export default Dashboard;