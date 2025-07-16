import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';
const EmptyCartContainer = () => {

    const user = useSelector((state) => state.user.user);
    return (
        <div className="bg-gray-100 h-[calc(100vh-160px)] p-5 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-sm max-w-7xl mx-auto  p-5 md:p-8 text-center top-[-80px]">

                {/* Cart Illustration */}
                <div className="w-80 h-56 mx-auto flex items-center justify-center relative">
                    <div className="relative w-28 h-28">
                        {/* Cart SVG */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#FCD34D" // yellow-300
                            viewBox="0 0 24 24"
                            className="w-full h-full drop-shadow-lg"
                        >
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.99c.89 0 1.67-.59 1.91-1.44L21 6H6.21L5.27 2H2v2h2l3.6 9.59-.95 1.73C5.16 16.37 6.48 18 8.16 18h11v-2H8.42c-.14 0-.25-.11-.25-.25l.03-.12.96-1.73z" />
                        </svg>

                        {/* Positioned Question Mark */}
                        <div className="absolute top-[22%] left-[52%] transform -translate-x-1/2 -translate-y-1/2 rotate-[8deg]">
                            <span className="text-gray-400 text-3xl font-bold drop-shadow-sm">?</span>
                        </div>
                    </div>
                </div>





                {/* Cart Empty Message */}
                <h2 className="text-2xl font-normal text-gray-800 mb-4 uppercase">
                    Your Nexstore Cart is empty
                </h2>

                <p className="text-sm text-gray-600 mb-8 uppercase">
                    Shop today's deals
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center items-center">
                    {user ? (
                        <Link href="/">
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 uppercase border border-gray-300">
                                Back to Home
                            </button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-md text-sm transition-colors duration-200 uppercase">
                                Sign in to your account
                            </button>
                        </Link>
                    )}
                </div>


                {/* Footer Text */}
                <div className="mt-4 px-4 sm:px-8 text-gray-600 text-[13px] sm:text-sm leading-relaxed tracking-wide uppercase">
                    <p className="mb-2 block sm:hidden">
                        <span className="font-medium">Note:</span> Prices may change. Cart reflects the latest price.
                    </p>
                    <p className="mb-2 block sm:hidden">
                        Got a promo code? Enter it at checkout.
                    </p>

                    <p className="mb-4 hidden sm:block">
                        <span className="font-medium">Note:</span> The price and availability of items at Amazon.in are subject to change. The shopping cart is a temporary place to store your selected items and reflects each item's most recent price.
                    </p>
                    <p className="mb-2 hidden sm:block">
                        Have a promotional code? You’ll be asked to enter it during checkout.
                    </p>
                </div>


            </div>
        </div>
    );
};

export default EmptyCartContainer;