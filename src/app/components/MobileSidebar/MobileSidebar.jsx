import React from 'react';
import {
  X, RotateCcw, Truck, Headphones, Heart, User, Clock, ChevronRight,
  User2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Link from 'next/link';

const MobileSidebar = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.user.user);
  const firstName = user?.name?.split(' ')[0];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-[90] transition-opacity duration-300 ${
          isOpen ? 'opacity-50 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] bg-white text-gray-800 z-[100] shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">HELLO, {firstName || "USER"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* PROFILE */}
        <div className="my-6">
          <div className="px-6 mb-3">
            <h3 className="text-lg font-bold text-gray-900">PROFILE</h3>
            
          </div>
          {/* No items here */}
        </div>

        {/* SWITCH ACCOUNTS */}
        <div className="mb-6 border-b border-gray-100">
            <Link href={'/account'}>
          <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group  border-gray-100">
             <div className='flex flex-row space-x-3 '>
                <User2 size={18} className="text-gray-500" />
            <span className="text-gray-800 font-medium">YOUR ACCOUNT </span>
             </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
          </Link>
        </div>

      

        {/* YOUR ORDERS */}
        <div className="mb-6">
          <div className="px-6 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">YOUR ORDERS</h3>
            
          </div>
          <div className="space-y-1">
            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <RotateCcw size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">BUY AGAIN</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <RotateCcw size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">RETURNS CENTRE</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Truck size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">DELIVERY SPEEDS & CHARGES</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Headphones size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">CUSTOMER SERVICE</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* YOUR ACCOUNT */}
        <div className="mb-6">
          <div className="px-6 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">YOUR ACCOUNT</h3>
          </div>
          <div className="space-y-1">
            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Heart size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">LISTS</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <User size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">RECOMMENDATIONS</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between group border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <Clock size={18} className="text-gray-500" />
                <span className="text-gray-800 font-medium">BROWSING HISTORY</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Custom Scrollbar */}
        <style jsx>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </>
  );
};

export default MobileSidebar;
