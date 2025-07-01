'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart, Package, Users, DollarSign,
  Search, Bell, Settings, Menu, X, BarChart3, Layers ,BadgePercent
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
    { icon: BarChart3, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/dashboard/orders' },
    { icon: Package, label: 'Products', href: '/admin/dashboard/products' },
    { icon: Layers, label: 'Categories', href: '/admin/dashboard/categories' },
    { icon: BadgePercent, label: 'Brands', href: '/admin/dashboard/brands' },
    { icon: Users, label: 'Customers', href: '/admin/dashboard/customers' },
    { icon: DollarSign, label: 'Sales', href: '/admin/dashboard/sales' },
    { icon: Settings, label: 'Settings', href: '/admin/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-md transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="flex items-center justify-between px-5 py-4 ">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ADMIN PANEL</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 mt-4">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mb-2 text-sm rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-yellow-50 text-yellow-800 border-r-4 border-yellow-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 " />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 uppercase">
                Dashboard
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow uppercase"
                >
                  LOG OUT
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden mt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
