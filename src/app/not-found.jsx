"use client";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh)] w-full flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center bg-gray-100 p-8 px-10">
        
        {/* Clean Icon */}
        <div className="mb-8">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 ">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        {/* Simple Typography */}
        <div className="mb-8">
          <h1 className="text-6xl font-semibold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-normal text-gray-900 mb-4 uppercase">Page not found</h2>
          <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
            We can't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors duration-200"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        

      </div>
    </section>
  );
}