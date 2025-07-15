"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <section className="flex h-[calc(100vh-160px)] w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Emoji Icon */}
          <div className="grid h-32 w-32 place-items-center rounded-full bg-slate-100 shadow-inner">
            <span className="text-6xl">😕</span>
          </div>

          <h1 className="text-3xl font-semibold text-slate-800 md:text-4xl uppercase">
            Product Not Found !
          </h1>
          <p className="max-w-md text-sm text-slate-600 md:text-base uppercase">
            We couldn't find the product you're looking for. It may have been removed or is currently unavailable.
          </p>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK TO HOME
          </Link>
        </div>
      </div>
    </section>
  );
}
