import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const ProductSuccessPage = () => {
    const [animationStage, setAnimationStage] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setAnimationStage(1), 300);
        const timer2 = setTimeout(() => setAnimationStage(2), 800);
        const timer3 = setTimeout(() => setAnimationStage(3), 1200);
        const timer4 = setTimeout(() => setShowDetails(true), 1600);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">





            {/* Main content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Success header */}
                <div className={`text-center mb-8 transition-all duration-800 ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-normal text-gray-900 mb-2">
                        PRODUCT CREATED SUCCESSFULLY!
                    </h1>
                    <p className="text-lg text-gray-600">Your product will be approved soon and ready for customers</p>
                </div>

                {/* Success details card */}
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm mb-6 transition-all duration-800 delay-300 ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Creation Complete</h3>
                                <p className="text-gray-600 mb-4">
                                    Your product has been successfully created and will be approved soon.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-yellow-50 p-4 rounded">
                                        <h4 className="font-semibold text-yellow-800 mb-1">Status</h4>
                                        <p className="text-yellow-700">Pending Approval</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded">
                                        <h4 className="font-semibold text-blue-800 mb-1">Visibility</h4>
                                        <p className="text-blue-700">Under Review</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action button */}

                <div
                    className={`flex justify-center mb-8 transition-all duration-800 delay-600 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                >
                    <Link href="/">
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                            GO TO HOME
                        </button>
                    </Link>
                </div>


                {/* Additional details */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-800 delay-900 ${showDetails ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Product created successfully
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Monitor performance metrics
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Awaiting approval review
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Creation Date:</span>
                                <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="text-sm font-medium text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Fulfillment:</span>
                                <span className="text-sm font-medium">Ready to Ship</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Amazon-style footer message */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-yellow-800">Important Reminder</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                Make sure to keep your inventory levels updated and respond to customer inquiries promptly to maintain a good seller rating.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSuccessPage;