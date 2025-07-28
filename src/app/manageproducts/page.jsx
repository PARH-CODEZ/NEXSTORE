'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { Plus, Download, Upload, Package, TrendingUp, Search, Filter, ArrowUpDown, RefreshCw, Clock, Ban, } from 'lucide-react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';
import SellerProductGrid from '../components/SellerProductCard/SellerProductCard';

export default function ProductsPage() {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [update, setUpdate] = useState(false)
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const statuses = ['all', 'active', 'inactive', 'pending'];

  const [activeProducts, setActiveProducts] = useState(0)
  const [pendingProducts, setPendingProducts] = useState(0)
  const [inactiveProducts, setInactiveProducts] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'seller') return;

    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/sellerproducts', {
          method: 'POST',
          credentials: 'include', // ensures cookies (like HttpOnly tokens) are sent
        });

        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log(data)
        setProducts(data.products || []);
        setActiveProducts(data.stats.activeProducts || 0)
        setPendingProducts(data.stats.pendingProducts || 0)
        setInactiveProducts(data.stats.inactiveProducts || 0)
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [user, update]);

  const handleUpdate = () => {
    setUpdate(prev => !prev);
  };

  useEffect(() => {

    if (!user || user.role !== 'seller') {
      return
    }

    async function fetchCategories() {
      try {
        setLoadingCats(true);
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCategories();
  }, []);



  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (p) => String(p.categoryId) === selectedCategory
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => {
        if (selectedStatus === 'active') {
          return p.isApproved === true && p.stockAvailable === true;
        }

        if (selectedStatus === 'pending') {
          return p.isApproved === false;
        }

        if (selectedStatus === 'inactive') {
          return p.stockAvailable === false;
        }

        return true;
      });
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedStatus, searchTerm]);

  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const totalProducts = filteredProducts.length;

  if (loading) return <FullScreenLoader />;

  return (
    <div className="overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-lg md:text-xl  font-semibold text-gray-900">
              MY PRODUCTS AND LISTINGS
            </h1>
            <p className="text-sm sm:text-base text-gray-600 uppercase">
              Manage your product listings and inventory
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/catlogue">
              <button className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-sm hover:bg-gray-700 transition-colors text-sm sm:text-base">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline uppercase">Add Product</span>
                <span className="sm:hidden">ADD NEW PRODUCT</span>
              </button>
            </Link>

            <div className="flex gap-2 sm:gap-3">
              <button className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="SEARCH YOUR PRODUCTS..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <select
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={loadingCats}
                >
                  <option value="all">ALL CATEGORIES</option>
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.CategoryName.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'ALL STATUS' : status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} of {products.length} products
              </span>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
                  title="Filter"
                >
                  <Filter className="w-4 h-4 text-gray-700 group-hover:text-black" />
                </button>

                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
                  title="Sort"
                >
                  <ArrowUpDown className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={handleRefresh}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="TOTAL PRODUCTS"
            value={totalProducts}
            Icon={Package}
            bgFrom="from-gray-200"
            bgTo="to-gray-300"
          />
          <StatCard
            title="PENDING PRODUCTS"
            value={`${pendingProducts}`}
            Icon={Clock}
            bgFrom="from-green-100"
            bgTo="to-green-200"
          />
          <StatCard
            title="INACTIVE PRODUCTS"
            value={inactiveProducts}
            Icon={Ban}
            bgFrom="from-purple-100"
            bgTo="to-purple-200"
          />
          <StatCard
            title="ACTIVE PRODUCTS"
            value={activeProducts}
            Icon={TrendingUp}
            bgFrom="from-yellow-100"
            bgTo="to-yellow-200"
          />
        </div>



        <SellerProductGrid products={filteredProducts} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}

/* ------- Reusable stat card component ------- */
function StatCard({ title, value, Icon, bgFrom, bgTo }) {
  return (
    <div
      className={`bg-gradient-to-br ${bgFrom} ${bgTo} text-white p-4 sm:p-6 rounded-sm shadow-md transition hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-black">{title}</p>
          <p className="text-xl sm:text-2xl font-semibold  text-black">{value}</p>
        </div>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8  " />
      </div>
    </div>
  );
}


