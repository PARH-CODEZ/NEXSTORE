import React from 'react';
import { XCircle } from 'lucide-react';

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 text-center">
      <XCircle className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase">Order Failed</h1>
      <p className="text-gray-700 mb-4 uppercase">
        We're sorry, but your order couldn't be confirmed. Please try again or contact support if the issue persists.
      </p>
      <button
        className="mt-4 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition uppercase"
        onClick={() => window.location.href = '/'}
      >
        Go Back Home
      </button>
    </div>
  );
}
