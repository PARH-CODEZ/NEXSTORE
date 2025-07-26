'use client'
import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, AlertCircle, Package, Tag, ImageIcon, Settings } from 'lucide-react';
import BrandModal from '../components/BrandModal/BrandModal';
import CategoryModal from '../components/CategoryModal/CategoryModal';
import FullScreenLoader from '../components/FullScreenLoader/FullScreenLoader';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar/Navbar';
import ProductSuccessPage from '../components/ProductSuccessPage/Productsuccesspage';
import { useSelector } from 'react-redux';

const ProductListingForm = () => {

    const user = useSelector((state) => state.user.user);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    async function fetchCategories() {
        try {
            setLoading(true)
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchBrands() {
        try {
            setLoading(true)
            const res = await fetch('/api/brand');
            if (!res.ok) throw new Error('Failed to fetch Brands');
            const data = await res.json();
            setBrands(data)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchVariantAttributes = async () => {
        try {
            const res = await fetch('/api/variant-attributes');
            if (!res.ok) throw new Error('Failed to fetch variant attributes');
            const data = await res.json();
            setAvailableAttributes(data); // <- Set the state
        } catch (error) {
            console.error('Error fetching variant attributes:', error);
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isSubmitted]);

    useEffect(() => {
        fetchBrands()
        fetchCategories();
        fetchVariantAttributes()
    }, []);





    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        name: '',
        categoryId: '',
        brandId: '',
        sellerId: user?.id || '',
        description: '',
        price: '',
        discountPercent: '',
        slug: '',
        isActive: true,
        images: [],
        displayImages: [],
        variants: [],
        specifications: []
    });

    const [currentVariant, setCurrentVariant] = useState({
        sku: '',
        variantName: '',
        additionalPrice: '',
        quantityAvailable: '',
        attributes: [],
        images: []
    });


    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [newAttributeName, setNewAttributeName] = useState('');

    const [currentSpecification, setCurrentSpecification] = useState({
        label: '',
        value: ''
    });


    const [uploadingImages, setUploadingImages] = useState(false);
    const [errors, setErrors] = useState({});

    // Generate slug from product name
    useEffect(() => {
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleImageUpload = async (files, isVariant = false, variantIndex = null) => {
        setUploadingImages(true);
        const uploadedImages = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'my_unsigned_preset');
            formData.append('folder', 'products');

            try {
                const res = await fetch('https://api.cloudinary.com/v1_1/daw7edgbf/image/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                uploadedImages.push({ imageUrl: data.secure_url });
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        if (isVariant && variantIndex !== null) {
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.map((variant, index) => {
                    if (index === variantIndex) {
                        const combined = [...(variant.images || []), ...uploadedImages];
                        const updated = combined.map((img, i) => ({
                            ...img,
                            isPrimary: i === 0
                        }));
                        return { ...variant, images: updated };
                    }
                    return variant;
                })
            }));
        } else {
            setFormData(prev => {
                const combined = [...(prev.images || []), ...uploadedImages];
                const updated = combined.map((img, i) => ({
                    ...img,
                    isPrimary: i === 0
                }));
                return { ...prev, images: updated };
            });
        }

        setUploadingImages(false);
    };


    const handleVariantImageUpload = async (files) => {
        setUploadingImages(true);
        const uploadedImages = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'my_unsigned_preset');
            formData.append('folder', 'products');

            try {
                const res = await fetch('https://api.cloudinary.com/v1_1/daw7edgbf/image/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                uploadedImages.push({ imageUrl: data.secure_url });
            } catch (error) {
                console.error('Variant image upload failed:', error);
            }
        }

        setCurrentVariant(prev => {
            const combined = [...(prev.images || []), ...uploadedImages];
            const updated = combined.map((img, i) => ({
                ...img,
                isPrimary: i === 0
            }));
            return { ...prev, images: updated };
        });

        setUploadingImages(false);
    };


    const handleDisplayImageUpload = async (files) => {
        setUploadingImages(true);
        const uploadedImages = [];

        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'my_unsigned_preset');
            formData.append('folder', 'products/display-images');

            try {
                const res = await fetch('https://api.cloudinary.com/v1_1/daw7edgbf/image/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();

                uploadedImages.push({
                    imageUrl: data.secure_url,
                    isPrimary: false, // default for now
                });
            } catch (error) {
                console.error('Display image upload failed:', error);
            }
        }

        setFormData(prev => {
            const newDisplayImages = [...prev.displayImages, ...uploadedImages];

            // Mark only the first image as primary
            const updatedImages = newDisplayImages.map((img, index) => ({
                ...img,
                isPrimary: index === 0,
            }));

            return {
                ...prev,
                displayImages: updatedImages,
            };
        });

        setUploadingImages(false);
    };


    const addVariant = () => {
        if (!currentVariant.variantName || !currentVariant.sku) {
            setErrors({ variant: 'Variant name and SKU are required' });
            return;
        }

        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { ...currentVariant, }]
        }));

        setCurrentVariant({
            sku: '',
            variantName: '',
            additionalPrice: '',
            quantityAvailable: '',
            attributes: [],
            images: []
        });
        setErrors({});
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };


    const handleAddNewAttribute = async () => {
        const trimmed = newAttributeName.trim();
        if (!trimmed) return;
        const res = await fetch('/api/variant-attributes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed })
        });
        const { attribute } = await res.json();

        setNewAttributeName('');
        fetchVariantAttributes()
    };

    const getAttributeValue = (attributeId) => {
        const found = currentVariant.attributes.find(attr => attr.attributeId === attributeId);
        return found?.value || '';
    };
    const addAttribute = (attributeId, value) => {
        const attribute = availableAttributes.find(attr => attr.id === attributeId);
        if (!attribute) return;

        setCurrentVariant(prev => ({
            ...prev,
            attributes: [
                ...prev.attributes.filter(attr => attr.attributeId !== attributeId),
                {
                    attributeId: attribute.id,
                    attributeName: attribute.name,
                    value: value
                }
            ]
        }));
    };


    const addSpecification = () => {
        if (!currentSpecification.label || !currentSpecification.value) {
            setErrors({ specification: 'Both label and value are required' });
            return;
        }

        setFormData(prev => ({
            ...prev,
            specifications: [...(prev.specifications || []), { ...currentSpecification, }]
        }));

        setCurrentSpecification({ label: '', value: '' });
        setErrors({});
    };
    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.price) newErrors.price = 'Price is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                setLoading(true)
                console.log(formData)
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('Failed to submit product');
                }

                const result = await response.json();
                console.log('Product created:', result);
                setLoading(false)
                setIsSubmitted(true);

            } catch (error) {
                console.error(error);
                alert('Error submitting product: ' + error.message);
                setLoading(false)
            }
        }
    };


    if (loading) return <FullScreenLoader />;

    return (
        <>
            <Navbar />
            {isSubmitted ? (
                <ProductSuccessPage />
            ) : (
                <div className="min-h-screen bg-gray-50 py-0 md:py-4 overflow-x-hidden">
                    <CategoryModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} onCategoryAdded={() => {
                        fetchCategories();
                        setShowCategoryModal(false);
                    }} />
                    <BrandModal isOpen={showModal} onClose={() => setShowModal(false)} onBrandAdded={() => {
                        fetchBrands();
                        setShowModal(false);
                    }} />

                    <div className="max-w-4xl mx-auto bg-white shadow-lg ">
                        <div className="bg-blue-500 text-white p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                {/* Left: Title and Subtitle */}
                                <div>
                                    <h1 className="md:text-2xl font-bold flex items-center">
                                        <Package className="mr-3" />
                                        LIST YOUR PRODUCT
                                    </h1>


                                </div>
                                {/* Right: Add Brand Button */}
                                <div className='flex  sm:ml-11 md:ml-0 flex-row md:justify-end items -center space-x-4 sm:justify-between'>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="mt-4 w-[180px] md:mt-0 inline-flex items-center justify-center px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-blue-700 transition"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        ADD BRAND
                                    </button>

                                    <button
                                        onClick={() => setShowCategoryModal(true)}
                                        className="mt-4 w-[190px] md:mt-0 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        ADD CATEGORY
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="p-6 space-y-8">
                            {/* Basic Information */}
                            <div className="border-b pb-6">

                                <h2 className="text-lg font-semibold mb-8 flex items-center uppercase">
                                    <Tag className="mr-2 text-blue-500" />
                                    BASIC INFORMATION [ADD BRAND OR CATEGORY IF NOT LISTED]

                                </h2>



                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                            Brand
                                        </label>
                                        <select
                                            value={formData.brandId}
                                            onChange={(e) => handleInputChange('brandId', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">SELECT BRAND (OPTIONAL)</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter product name"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                            Product Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter product title"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 uppercase mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => handleInputChange('categoryId', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.CategoryID} value={cat.CategoryID}>
                                                    {cat.CategoryName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 uppercase mb-2">
                                            Price ($) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 uppercase" >
                                            Discount Percentage
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            max="100"
                                            value={formData.discountPercent}
                                            onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                        Product Slug (Auto-generated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="product-slug"
                                    />
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe your product..."
                                    />
                                </div>
                            </div>


                            {/* Product Display Images */}
                            <div className="border-b pb-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center uppercase">
                                    <ImageIcon className="mr-2 text-green-500 uppercase" />
                                    Display Images
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {formData.displayImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.imageUrl}
                                                alt={`Display ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                            {image.isPrimary && (
                                                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 uppercase py-1 rounded">
                                                    Primary
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        displayImages: prev.displayImages.filter((_, i) => i !== index),
                                                    }))
                                                }
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleDisplayImageUpload(Array.from(e.target.files))
                                        }
                                        className="hidden"
                                        id="display-images"
                                    />
                                    <label htmlFor="display-images" className="cursor-pointer">
                                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                        <p className="text-gray-600">Click to upload display images or drag and drop</p>
                                        <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                                    </label>
                                </div>

                                {errors.displayImages && (
                                    <p className="text-red-500 text-sm mt-2">{errors.displayImages}</p>
                                )}
                            </div>


                            {/* Product Specifications */}
                            <div className="border-b pb-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center">
                                    <Package className="mr-2 text-blue-500 uppercase" />
                                    Product Specifications
                                </h2>

                                {/* Existing Specifications */}
                                {formData.specifications.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-3 uppercase">Added Specifications</h3>
                                        <div className="space-y-2">
                                            {formData.specifications.map((spec, index) => (
                                                <div key={spec.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-gray-700">{spec.label}:</span>
                                                        <span className="ml-2 text-gray-600">{spec.value}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSpecification(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Specification */}
                                <div className="bg-green-50 p-4 rounded-lg ">
                                    <h3 className="font-medium mb-3 uppercase">Add Specification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Specification Label (e.g., Weight, Dimensions)"
                                            value={currentSpecification.label}
                                            onChange={(e) => setCurrentSpecification(prev => ({ ...prev, label: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value (e.g., 2.5kg, 15cm x 10cm)"
                                            value={currentSpecification.value}
                                            onChange={(e) => setCurrentSpecification(prev => ({ ...prev, value: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    {errors.specification && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-red-600 text-sm flex items-center">
                                                <AlertCircle size={16} className="mr-2" />
                                                {errors.specification}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={addSpecification}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex uppercase items-center"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Specification
                                    </button>
                                </div>
                            </div>

                            {/* Product Variants */}
                            <div className="border-b pb-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center uppercase">
                                    <Settings className="mr-2 text-blue-500 " />
                                    Product Variants
                                </h2>

                                {/* Existing Variants */}
                                {formData.variants.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-3">Added Variants</h3>
                                        <div className="space-y-3">
                                            {formData.variants.map((variant, index) => (
                                                <div key={variant.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{variant.variantName}</h4>
                                                        <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                                                        <p className="text-sm text-gray-600">Additional Price: ${variant.additionalPrice || 0}</p>
                                                        <p className="text-sm text-gray-600">Quantity: {variant.quantityAvailable || 0}</p>
                                                        {variant.images && variant.images.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 mb-1">Variant Images:</p>
                                                                <div className="flex gap-2">
                                                                    {variant.images.map((img, imgIndex) => (
                                                                        <img
                                                                            key={imgIndex}
                                                                            src={img.imageUrl}
                                                                            alt={`Variant ${imgIndex + 1}`}
                                                                            className="w-12 h-12 object-cover rounded border"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {variant.attributes.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {variant.attributes.map((attr, i) => (
                                                                    <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                                                        {attr.attributeName}: {attr.value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add New Variant */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-3 uppercase">Add New Variant</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Variant Name (e.g., Red Large)"
                                            value={currentVariant.variantName}
                                            onChange={(e) => setCurrentVariant(prev => ({ ...prev, variantName: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="SKU"
                                            value={currentVariant.sku}
                                            onChange={(e) => setCurrentVariant(prev => ({ ...prev, sku: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Additional Price"
                                            value={currentVariant.additionalPrice}
                                            onChange={(e) => setCurrentVariant(prev => ({ ...prev, additionalPrice: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Quantity Available"
                                            value={currentVariant.quantityAvailable}
                                            onChange={(e) => setCurrentVariant(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Attributes */}
                                    <div className="mb-4">
                                        <label className="block text-md font-medium text-gray-700 mb-2 uppercase">Attributes</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableAttributes.map(attr => (
                                                <div key={attr.id}>
                                                    <label className="block text-md text-gray-600 mb-1 uppercase">{attr.name}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                                                        value={getAttributeValue(attr.id)} // ✅ controlled value
                                                        onChange={(e) => addAttribute(attr.id, e.target.value)} // ✅ updates on every change
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            ))}

                                        </div>

                                        {/* Add New Attribute */}
                                        <div className="mt-4">
                                            <label className="block text-md font-medium text-gray-600 mb-1 uppercase">Add New Attribute</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Finish"
                                                    value={newAttributeName}
                                                    onChange={(e) => setNewAttributeName(e.target.value)}
                                                    className="w-[49%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddNewAttribute}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex uppercase items-center"
                                                >
                                                    ADD ATTRIBUTE
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Variant Images */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>

                                        {/* Show current variant images */}
                                        {currentVariant.images && currentVariant.images.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mb-3">
                                                {currentVariant.images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={image.imageUrl}
                                                            alt={`Variant ${index + 1}`}
                                                            className="w-full h-20 object-cover rounded border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentVariant(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== index)
                                                            }))}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload variant images */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleVariantImageUpload(Array.from(e.target.files))}
                                                className="hidden"
                                                id="variant-images"
                                            />
                                            <label htmlFor="variant-images" className="cursor-pointer">
                                                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                                                <p className="text-sm text-gray-600 uppercase ">Upload variant-specific images</p>
                                                <p className="text-xs text-gray-400 mt-1 uppercase">PNG, JPG up to 10MB each</p>
                                            </label>
                                        </div>
                                    </div>

                                    {errors.variant && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-red-600 text-sm flex items-center">
                                                <AlertCircle size={16} className="mr-2" />
                                                {errors.variant}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={addVariant}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Variant
                                    </button>
                                </div>
                            </div>


                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={uploadingImages}
                                    className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 font-medium text-lg uppercase"
                                >
                                    {uploadingImages ? 'Uploading Images...' : 'List Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
};

export default ProductListingForm;

