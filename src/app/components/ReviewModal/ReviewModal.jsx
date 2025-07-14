'use client';
import React, { useState,useEffect } from 'react';
import { X, Star } from 'lucide-react';


export default function ReviewModal({ isOpen, onClose, productId, userId, onReviewAdded }) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!review.trim() || !rating) {
            setError('Please provide a rating and a review.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userId, rating, review }),
            });

            if (!res.ok) throw new Error('Failed to add review');

            setSuccess(true);
            setReview('');
            setRating(5);
            onReviewAdded?.();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-10 backdrop-blur-sm p-4 ">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-100 rounded-lg shadow-lg w-full max-w-md p-6 relative border border-gray-400 "
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">ADD REVIEW</h2>

                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                {success && <p className="text-sm text-green-600 mb-3">Review added successfully!</p>}

                <form onSubmit={handleSubmit}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">RATING</label>
                    <div className="flex space-x-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className={`cursor-pointer ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>

                    <label className="block text-xs font-semibold text-gray-600 mb-1">REVIEW</label>
                    <textarea
                        rows={4}
                        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Share your experience..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50 text-sm font-semibold tracking-wide"
                    >
                        {loading ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                    </button>
                </form>
            </div>
        </div>
    );
}
