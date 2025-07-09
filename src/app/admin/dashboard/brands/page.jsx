'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Plus, X, Camera } from 'lucide-react';
import FullScreenLoader from '@/app/components/FullScreenLoader/FullScreenLoader';
import BrandModal from '@/app/components/BrandModal/BrandModal';
import { toast } from 'react-toastify';

const BrandPage = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/brand');
            if (!res.ok) throw new Error('Failed to fetch brands');
            const data = await res.json();
            setBrands(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);


    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;
        try {
            setDeletingId(id);
            const res = await fetch(`/api/brand?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete brand');
            setBrands((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };
    if (loading) return <FullScreenLoader />;

    return (
        <>
            <BrandModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onBrandAdded={() => {
                fetchBrands();
                setIsModalOpen(false);
            }} />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 overflow-x-hidden">

                <div className="flex justify-between mb-6 sm:mb-8 flex-wrap gap-3 items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 uppercase">Brands</h1>
                        <p className="text-sm text-gray-600 uppercase">Manage your brand collection</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 sm:px-6 h-[40px] bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow"
                    >
                        <Plus className="w-5 h-5 mr-2" /> ADD BRAND
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {brands.map((brand) => (
                        <div key={brand.id} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 mb-4">
                                <img
                                    src={brand.imageUrl || '/placeholder.png'}
                                    alt={brand.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 text-center truncate mb-2 uppercase">{brand.name}</h3>
                            <button
                                onClick={() => handleDelete(brand.id)}
                                disabled={deletingId === brand.id}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                {deletingId === brand.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    ))}
                </div>

            </div>

        </>
    );
};

export default BrandPage;
