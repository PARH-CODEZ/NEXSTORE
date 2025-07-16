import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';

const EmptyOrdersContainer = () => {
    const user = useSelector((state) => state.user.user);

    return (
        <div className="bg-gray-100 h-[calc(100vh-160px)] p-5 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-sm max-w-7xl mx-auto p-5 md:p-8 text-center">

                {/* Illustration */}
                <div className="w-80 h-56 mx-auto flex items-center justify-center relative">
                    <div className="relative w-32 h-28">
                        {/* Truck SVG - Yellow Theme */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            className="w-full h-full drop-shadow-md"
                            fill="#FCD34D"
                        >
                            <path d="M2 16h38v26H2z" fill="#FCD34D" />
                            <path d="M40 24h9l9 10v8H40z" fill="#FBBF24" />
                            <circle cx="14" cy="48" r="4" fill="#4B5563" />
                            <circle cx="48" cy="48" r="4" fill="#4B5563" />
                            <path d="M14 44a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm34 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="#9CA3AF" />
                        </svg>

                        {/* Question Mark - Soft Gray, Well Positioned */}
                        <div className="absolute top-[18%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 rotate-[5deg]">
                            <span className="text-gray-400 text-[30px] font-extrabold">?</span>
                        </div>
                    </div>
                </div>


                {/* Title */}
                <h2 className="text-2xl font-normal text-gray-800 mb-4 uppercase">
                    You have no orders yet
                </h2>

                {/* Subtitle */}
                <p className="text-sm text-gray-600 mb-8 uppercase">
                    Your orders will appear here once you place one
                </p>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center items-center">
                    {user ? (
                        <Link href="/">
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 uppercase border border-gray-300">
                                Start Shopping
                            </button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 uppercase">
                                Sign in to view orders
                            </button>
                        </Link>
                    )}
                </div>

                {/* Footer Text */}
                <div className="mt-4 px-4 sm:px-8 text-gray-600 text-[13px] sm:text-sm leading-relaxed tracking-wide uppercase">
                    <p className="mb-2 block sm:hidden">
                        <span className="font-medium">Note:</span> Orders will be listed here after purchase.
                    </p>
                    <p className="mb-4 hidden sm:block">
                        <span className="font-medium">Note:</span> Once you place an order, it will appear here. You can track your order status, delivery, and details from this page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmptyOrdersContainer;
