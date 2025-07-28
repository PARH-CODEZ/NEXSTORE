'use client';
import React, { useEffect, useState } from 'react';
import { Mail, Phone, User, ShieldCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import CategoryNav from '../components/Categories/Categories';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { setUser } from '@/store/userSlice';
import { Edit, Plus, Trash2, MapPin, Home } from 'lucide-react';
import { toast } from 'react-toastify';
import { Briefcase, BadgeIndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function EcommerceProfile() {
  const router = useRouter()
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [businessName, setBusinessName] = useState('')
  const [gstin, setGstin] = useState('')

  const [userInfo, setUserInfo] = useState({
    name: user.name,
    email: user.email,
    mobile: user.phone
  });

  const [editingField, setEditingField] = useState(null);

  const handleUserInfoEdit = (field) => {
    setEditingField(field);
  };

  const saveChanges = async (field) => {
    let value = userInfo[field];

    if (field === 'email') {
      value = value.toLowerCase();
    }

    // Validation
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Invalid email');
      return;
    }
    if (field === 'mobile' && !/^\+?\d{7,15}$/.test(value)) {
      toast.error('Invalid mobile number');
      return;
    }

    // Check uniqueness if email or mobile
    if (field === 'email' || field === 'mobile') {
      const checkField = field === 'email' ? 'email' : 'phone';
      try {
        const checkRes = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [checkField]: value }),
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          toast.error(field === 'email' ? 'Email already in use.' : 'Phone number already in use.');
          return;
        }
      } catch {
        toast.error('Error checking user data');
        return;
      }
    }

    // Proceed to update
    try {
      const res = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setUser(data.user));
        toast.success('Update successful');
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating user');
    }
  };


  // ADDRESS SECTION
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState([]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/address/list', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        console.log(data.addresses)
        setAddresses(data.addresses);
      } else {
        console.error(data.error || 'Failed to load addresses');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    addresses.map((address) => {
      console.log(address.AddressID)
    })
    fetchAddresses();

  }, []);


  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);


  const [addressForm, setAddressForm] = useState({
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    State: '',
    PostalCode: '',
    Country: 'India',
    IsDefault: false,
    AddressType: 'Shipping'
  });


  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    try {
      // Determine if creating new or updating existing address
      const method = 'PUT';
      const addressId = editingAddress ? editingAddress.AddressID : 'new';

      const res = await fetch(`/api/address/${addressId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          addressLine1: addressForm.AddressLine1,
          addressLine2: addressForm.AddressLine2,
          city: addressForm.City,
          state: addressForm.State,
          zipCode: addressForm.PostalCode,
          country: addressForm.Country,
          isDefault: addressForm.IsDefault,

        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh the addresses list after success
        await fetchAddresses();

        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
          AddressLine1: '',
          AddressLine2: '',
          City: '',
          State: '',
          PostalCode: '',
          Country: 'India',
          IsDefault: false,
          AddressType: 'Shipping'
        });
      } else {
        console.error(data.error || 'Failed to save address');
        toast.error(data.error || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Error saving address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetch(`/api/address/${addressId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      console.log(addressId)
      const data = await res.json();

      if (res.ok) {
        await fetchAddresses();
      } else {
        console.error(data.error || 'Failed to delete address');
      }
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  };


  useEffect(() => {
    if (user?.role !== 'seller') return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/seller/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        console.log('Profile data from backend:', data);
        if (data.error) {
          console.error('Fetch error:', err);
        } else {
          setBusinessName(data.BusinessName)
          setGstin(data.GSTNumber)
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchProfile();
  }, [user]);



  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();

      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  };



  return (
    <>


      <Navbar />
      <div className='w-full hidden md:block'>
        <CategoryNav />
      </div>
      {loading ?
        (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] space-y-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-gray-600">LOADING...</div>
          </div>
        ) : (
          <>
            <div className='overflow-x-hidden bg-gray-200'>
              <div className="max-w-5xl mx-auto p-6 min-h-screen overflow-x-hidden">
                <div className="bg-gray-50 rounded-lg shadow-xl border border-gray-200">
                  <div className="px-6 py-8 border-b border-gray-200">
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                      LOGIN AND SECURITY
                    </h1>
                  </div>

                  <div className="p-6 space-y-6">

                    {/* Name Field */}
                    <ProfileField
                      label="NAME"
                      icon={<User className="w-5 h-5 text-gray-500 mr-2" />}
                      field="name"
                      value={userInfo.name}
                      isEditing={editingField === 'name'}
                      onChange={(val) => setUserInfo(prev => ({ ...prev, name: val }))}
                      onEdit={() => handleUserInfoEdit('name')}
                      onSave={saveChanges}
                      setEditingField={setEditingField}
                    />


                    {/* Mobile Field */}
                    <ProfileField
                      label="MOBILE NUMBER"
                      icon={<Phone className="w-5 h-5 text-gray-500 mr-2" />}
                      field="mobile"
                      value={userInfo.mobile}
                      isEditing={editingField === 'mobile'}
                      onChange={(val) => setUserInfo(prev => ({ ...prev, mobile: val }))}
                      onEdit={() => handleUserInfoEdit('mobile')}
                      onSave={saveChanges}
                      setEditingField={setEditingField}
                      hint="THIS MOBILE NUMBER WILL BE USED FOR IMPORTANT SECURITY ALERTS. IT WON'T BE USED FOR LOGIN."
                    />

                    {/* Email Field */}
                    <StaticProfileField
                      label="Email"
                      icon={<Mail className="w-5 h-5 text-gray-500 mr-2" />}
                      value={userInfo.email}
                      hint="THIS EMAIL ADDRESS WILL BE USED FOR SIGN IN, ACCOUNT RECOVERY, AND IMPORTANT SECURITY NOTIFICATIONS."
                    />

                    {user?.role === "seller" && (
                      <>
                        <StaticProfileField
                          label="Business Name"
                          icon={<Briefcase className="w-5 h-5 mr-2 text-blue-600" />}
                          value={businessName}
                        />
                        <StaticProfileField
                          label="GST Number"
                          icon={<BadgeIndianRupee className="w-5 h-5 mr-2 text-blue-600" />}
                          value={gstin}
                        />
                      </>
                    )}

                    {/* Addresses Section */}

                    <div className=" py-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <Home className="w-6 h-6 text-gray-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">YOUR ADDRESSES</h2>
                      </div>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-4 py-2 hover:bg-[#FF9800] bg-[#FF9800] rounded-md text-sm font-medium  transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        ADD NEW ADDRESS
                      </button>
                    </div>

                    {/* Address Form */}
                    {showAddressForm && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">
                          {editingAddress ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">ADDRESS LINE 1 *</label>
                              <input
                                type="text"
                                value={addressForm.AddressLine1}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, AddressLine1: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">ADDRESS LINE 2</label>
                              <input
                                type="text"
                                value={addressForm.AddressLine2}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, AddressLine2: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">CITY *</label>
                              <input
                                type="text"
                                value={addressForm.City}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, City: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">STATE</label>
                              <input
                                type="text"
                                value={addressForm.State}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, State: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">POSTAL CODE *</label>
                              <input
                                type="text"
                                value={addressForm.PostalCode}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, PostalCode: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">COUNTRY *</label>
                              <select
                                value={addressForm.Country}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, Country: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="India">India</option>

                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 uppercase mb-1">ADDRESS TYPE</label>
                              <select
                                value={addressForm.AddressType}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, AddressType: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Shipping">HOME</option>
                                <option value="Billing">BILLING</option>
                                <option value="Both">BOTH</option>
                              </select>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="isDefault"
                                checked={addressForm.IsDefault}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, IsDefault: e.target.checked }))}
                                className="mr-2"
                              />
                              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 uppercase">
                                SET AS DEFAULT ADDRESS
                              </label>
                            </div>
                          </div>
                          <div className="flex space-x-4 pt-4">
                            <button
                              onClick={handleAddressSubmit}
                              className="px-6 py-2 bg-[#FF9900]  rounded-md text-sm font-medium hover:bg-[#FF9800] transition-colors uppercase"
                            >
                              {editingAddress ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddressForm(false);
                                setEditingAddress(null);
                                setAddressForm({
                                  AddressLine1: '',
                                  AddressLine2: '',
                                  City: '',
                                  State: '',
                                  PostalCode: '',
                                  Country: 'India',
                                  IsDefault: false,
                                  AddressType: 'Shipping'
                                });
                              }}
                              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors uppercase"
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Address List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div key={address.AddressID} className="border border-gray-200 rounded-lg p-4 relative">
                          {address.IsDefault && (
                            <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded uppercase font-medium">
                              DEFAULT
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-500 uppercase">
                                {address.AddressType} ADDRESS
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-900  mb-2">
                            <div className="font-medium text-sm uppercase">{address.AddressLine1}</div>
                            {address.AddressLine2 && <div className='text-sm'>{address.AddressLine2}</div>}
                            <div className='text-sm'>{address.City}, {address.State} {address.PostalCode}</div>
                            <div className='text-sm uppercase'>{address.Country}</div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center uppercase"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.AddressID)}
                              className="px-3 py-1 text-sm border border-red-300 rounded text-red-700 hover:bg-red-50 transition-colors flex items-center uppercase"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center my-8 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-15 py-2 rounded uppercase"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>


            </div>
            <Footer />
          </>
        )
      }

    </>
  );
}

function ProfileField({ label, icon, field, value, isEditing, onChange, onEdit, onSave, setEditingField, hint, hintClass = 'text-gray-600' }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          {icon}
          <label className="text-lg font-medium text-gray-900 uppercase tracking-wide">{label}</label>
        </div>
        {isEditing ? (
          <input
            type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              onSave(field);
              setEditingField(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(field);
                setEditingField(null);
              }
            }}
            className="text-gray-700 border border-gray-300 rounded px-3 py-1"
            autoFocus
          />
        ) : (
          <div className="text-gray-700 text-md">{value}</div>
        )}
        {hint && <div className={`text-sm mt-1 w-[90%] ${hintClass}`}>{hint}</div>}
      </div>
      <button
        onClick={onEdit}
        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        EDIT
      </button>
    </div>
  );
}

function StaticProfileField({ label, icon, value, hint, hintClass = 'text-gray-600' }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          {icon}
          <label className="text-lg font-medium text-gray-900 uppercase ">{label}</label>
        </div>
        <div className="text-gray-700 text-md">{value || 'Not available'}</div>
        {hint && <div className={`text-sm mt-1 w-[90%] ${hintClass}`}>{hint}</div>}
      </div>
    </div>
  );
}
