'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart, Package, Users, DollarSign,
  Search, Bell, Settings, Menu, X, BarChart3, Layers, BadgePercent,
  ChevronRight, User, LogOut
} from 'lucide-react';

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  const menuItems = [
    { icon: BarChart3, label: 'DASHBOARD', href: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'ORDERS', href: '/admin/dashboard/orders' },
    { icon: Package, label: 'PRODUCTS', href: '/admin/dashboard/products' },
    { icon: Layers, label: 'CATEGORIES', href: '/admin/dashboard/categories' },
    { icon: BadgePercent, label: 'BRANDS', href: '/admin/dashboard/brands' },
    { icon: Settings, label: 'SETTINGS', href: '/admin/dashboard/settings' },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="h-[100vh] bg-gradient-to-br from-slate-50 to-gray-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-md font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ADMIN
              </span>
              <div className="text-xs text-gray-500 font-medium">CONTROL PANEL</div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 text-sm rounded-xl font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-200/50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'text-blue-600' : 'group-hover:scale-110'}`} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-4 h-4 text-blue-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">ADMIN USER</div>
              <div className="text-xs text-gray-500">SUPER ADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl md:text-xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500 mt-1 uppercase hidden md:block">
                  Welcome back, manage your store efficiently
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="SEARCH ORDERS PRODUCTS CUSTOMERS..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Header Actions */}
              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className=" mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}