'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import FullScreenLoader from '../FullScreenLoader/FullScreenLoader';
import MobileSidebar from '../MobileSidebar/MobileSidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    MapPin,
    ShoppingCart,
    Globe,
    User,
    ChevronDown
} from 'lucide-react';
import AccountModal from '../AccountModal/AccountModal';
import Link from 'next/link';

const Navbar = ({ notFixed = false }) => {

    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [addresses, setAddresses] = useState([]);
    const [defaultCity, setDefaultCity] = useState('');
    const [defaultPostalCode, setDefaultPostalCode] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const user = useSelector((state) => state.user.user);

    useEffect(() => {
        if (pathname === '/') {
            setSearchTerm('');
        } else if (pathname.startsWith('/category/')) {
            const slug = pathname.split('/category/')[1];
            const decoded = decodeURIComponent(slug);
            const formatted = decoded.replace(/[-_]/g, ' ').toUpperCase();
            setSearchTerm(formatted);
        }
    }, [pathname]);
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch('/api/address/list', { credentials: 'include' });
                const data = await res.json();

                if (res.ok) {
                    setAddresses(data.addresses);
                    const def = data.addresses.find(a => a.IsDefault);
                    if (def) {
                        setDefaultCity(def.City);
                        setDefaultPostalCode(def.PostalCode);
                    }
                } else {
                    toast.error(data.error || 'Failed to load addresses');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                toast.error('Address fetch failed');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchAddresses();
        }
    }, []);

    const firstName = user?.name?.split(' ')[0];

    const handleClick = () => {
        if (user?.role === 'seller') {
            router.push('/product');
        } else {
            router.push('/orders');
        }
    };

    /* ── state ─────────────────────────────────── */
    const [searchCategory, setSearchCategory] = useState('All');
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const router = useRouter();

    /* ── hover helpers ─────────────────────────── */
    const openModal = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setIsAccountModalOpen(true);
    };

    const scheduleClose = () => {
        const t = setTimeout(() => setIsAccountModalOpen(false), 150);
        setHoverTimeout(t);
    };

    const holdModalOpen = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
    };

    const forceClose = () => setIsAccountModalOpen(false);

    /* ── sign‑in redirect ──────────────────────── */
    const handleSignIn = () => {
        forceClose();
        router.push('/login');   // ⬅️ redirects to /login
    };


    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ categories: [], products: [] })
    const [showResults, setShowResults] = useState(false);
    const resultsRef = useRef(null);


    useEffect(() => {
        function handleClickOutside(event) {
            if (resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }

        if (showResults) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showResults]);

    const fetchResults = async () => {
        if (!searchTerm.trim()) return setSearchResults({ categories: [], products: [] });

        const res = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
    };

    const handleSelectCategory = (category) => {
        setShowResults(false);
        router.push(`/category/${category.slug}`);
    };

    const handleSelectProduct = (product) => {
        setShowResults(false);
        router.push(`/category/${product.categorySlug}?product=${product.id}`);
    };

    const fetchUserQuery = () => {
        setShowResults(false)
        router.push(`/category/${searchTerm}`)
    }


























    /* ── render ─────────────────────────────────── */
    return (
        <div className={`bg-[#0D0D0D] text-white z-50  p-[10px] pt-[25px] md:py-4 ${notFixed ? '' : 'sticky top-0'}`}>
            <div className="w-full px-2">
                <div className=" items-center h-[140px] md:flex md:h-[50px]">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-bold text-xl md:text-sm lg:text-md  xl:text-2xl cursor-pointer select-none relative z-50"
                    >
                        NEXSTORE
                    </Link>
                    <div className='flex flex-col-reverse md:flex-none md:flex-row md:flex-grow md:items-center'>

                        <Link href="/account"> 
                            <div className="flex md:hidden items-center px-1 py-2 gap-2 text-md border-t border-gray-700">
                                <MapPin size={20} />
                                <div>
                                    <span className="text-gray-300  uppercase">Delivering to {defaultPostalCode || '400001'}</span> •{' '}
                                    <span className="font-semibold text-md underline uppercase"> {defaultCity || 'Update Location'}</span>
                                </div>
                            </div>
                        </Link>


                        <Link href="/account">
                            <div className="hidden sm:flex items-center px-2 py-1 hover:bg-gray-800 rounded cursor-pointer select-none max-w-[220px] truncate">
                                <MapPin size={20} className="mr-2" />
                                <div>
                                    <div className="text-gray-300 text-xs md:text-[10px] lg:text-xs uppercase truncate">
                                        Delivering to {defaultPostalCode || '400001'}
                                    </div>
                                    <div className="font-medium text-xs md:text-[10px] lg:text-xs uppercase underline">
                                        {defaultCity || 'Update Location'}
                                    </div>
                                </div>
                            </div>
                        </Link>



                        <div className="flex px-2 py-1 text-sm gap-3 font-semibold  border-gray-700 md:hidden mt-[10px]">
                            
                        </div>












                        {/* Search */}
                        <div className="relative w-[100%] mt-[15px] md:mt-0">
                            <div className="flex rounded-md overflow-hidden">
                                <select
                                    className=" hidden md:block bg-white text-gray-900 px-3 py-2 text-sm border-r border-gray-300 outline-none cursor-pointer"
                                // Add your category filter logic here
                                // value={searchCategory} onChange={}
                                >
                                    <option>ALL</option>
                                    {/* Add categories here */}
                                </select>

                                <input
                                    type="text"
                                    placeholder="SEARCH NEXTORE.IN"
                                    className="flex-1 px-3 py-2 text-black bg-gray-100 text-sm outline-none"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        if (value.trim()) {
                                            fetchResults(value);  // pass search term directly
                                            setShowResults(true);
                                        } else {
                                            setShowResults(false);
                                        }
                                    }}
                                    onFocus={() => searchTerm && setShowResults(true)}
                                />

                                <button
                                    className="bg-[#FF9900] hover:bg-[#FF9800] px-3 py-2 transition-colors"
                                    onClick={fetchUserQuery}
                                >
                                    <Search size={20} className="text-gray-900" />
                                </button>
                            </div>

                            {showResults && (
                                <div
                                    ref={resultsRef}
                                    className="absolute left-0 top-full mt-1 w-full z-50 bg-white shadow-2xl rounded-lg border border-gray-200"
                                >
                                    {/* Categories */}
                                    {searchResults.categories.length > 0 && (
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="text-base font-bold text-black uppercase tracking-wide mb-3">
                                                Categories
                                            </h3>
                                            {searchResults.categories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="px-3 py-3 hover:bg-gray-100 cursor-pointer rounded"
                                                    onClick={() => handleSelectCategory(cat)}
                                                >
                                                    <div className="text-lg font-bold text-purple-700 uppercase">
                                                        {cat.name}
                                                    </div>
                                                    {cat.description && (
                                                        <div className="text-gray-600 text-sm uppercase">
                                                            {cat.description}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Products */}
                                    {searchResults.products.length > 0 && (
                                        <div className="p-4">
                                            <h3 className="text-base font-bold text-black uppercase tracking-wide mb-3">
                                                Products
                                            </h3>
                                            {searchResults.products.map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    className="px-3 py-3 hover:bg-gray-100 cursor-pointer rounded"
                                                    onClick={() => handleSelectProduct(prod)}
                                                >
                                                    <div className="text-lg font-semibold text-purple-500 uppercase">
                                                        {prod.name}
                                                    </div>
                                                    <div className="text-gray-600 text-sm uppercase">
                                                        IN {prod.categoryName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results */}
                                    {searchResults.categories.length === 0 && searchResults.products.length === 0 && (
                                        <div className="p-4 text-gray-500 text-center text-sm uppercase">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
















                        {/* Right‑hand actions */}
                        <div className="flex justify-end space-x-2 md: space-x items-center select-none mt-[-35px] md:mt-0">
                            {/* Language */}
                            <div className=" hidden lg:flex flex flex-row items-center px-2 py-1 hover:bg-gray-800 rounded cursor-pointer">
                                <Globe size={20} className="mr-1" />
                                <span className="font-semibold text-lg">EN</span>
                            </div>

                            {/* Account (hover target) */}
                            <div
                                className="hidden md:block md:relative flex flex-col px-2 py-1 hover:bg-gray-800 rounded cursor-pointer text-sm leading-tight"
                                onMouseEnter={openModal}
                                onMouseLeave={scheduleClose}
                            >

                                {/* Desktop: HELLO, {name} */}
                                <span className="text-gray-300 hidden md:block md:text-[10px] lg:text-[14px]">
                                    HELLO, {firstName || ''}
                                </span>

                                {/* Desktop: ACCOUNT */}
                                <span className="font-semibold hidden md:flex truncate md:text-[10px] lg:text-[14px]">ACCOUNT & LISTS ▼</span>

                            </div>

                            <div className="flex items-center text-gray-300 md:hidden space-x-1 "
                                onClick={() => setSidebarOpen(true)}>
                                <User size={25} className="font-bold" />
                                <span className="text-md font-semibold">
                                    {user ? user.name.trim().split(' ')[0] : 'SIGN IN'}
                                </span>
                            </div>



                            {/* Returns & Orders */}
                            <div onClick={handleClick} className="hidden md:flex flex-col px-2 py-1 hover:bg-gray-800 rounded cursor-pointer text-sm leading-tight">
                                {user?.role === 'seller' ? (
                                    <>
                                        <span className="text-gray-300 md:text-[10px] lg:text-[14px] ">LIST NEW </span>
                                        <span className="font-semibold uppercase md:text-[10px] lg:text-[14px]">PRODUCT </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-300 md:text-[10px] lg:text-[14px] ">RETURNS</span>
                                        <span className="font-semibold uppercase truncate md:text-[10px] lg:text-[14px]">&amp; ORDERS</span>
                                    </>
                                )}
                            </div>

                            {/* Cart */}
                            <Link href={'/cart'}>
                                <div className="relative flex items-center px-2 py-1 hover:bg-gray-800 rounded cursor-pointer">
                                    <ShoppingCart size={25} />
                                    <span className="absolute -top-0 -right-1 bg-[#FF9900] text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        0
                                    </span>
                                    <span className="ml-1 font-semibold hidden sm:inline md:hidden lg:block">CART</span>
                                </div>
                            </Link>
                        </div>

                    </div>


                </div>
            </div>

            {/* Account dropdown */}
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={forceClose}
                onSignIn={handleSignIn}
                onMouseEnter={holdModalOpen}
                onMouseLeave={scheduleClose}
            />
            <div className='md:hidden'>
                <MobileSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>


        </div>
    );
};

export default Navbar;
