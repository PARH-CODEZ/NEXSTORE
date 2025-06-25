'use client';
import React from 'react';
import SignInButton from '../Buttons/SignInButton';
// import { useSelector, useDispatch } from 'react-redux';
// import { clearUser } from '@/store/userSlice';
import { useRouter } from 'next/navigation';

const AccountModal = ({
  isOpen,
  onClose,
  onSignIn,
  onMouseEnter,
  onMouseLeave,
}) => {
//   const user = useSelector((state) => state.user.user);
const user=''
//   const dispatch = useDispatch();
  const router = useRouter();

  const onSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      dispatch(clearUser());
      router.push('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-[50px] right-4 z-[60]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6 flex justify-center items-center flex-col">
            {user ? (
              <SignInButton text="SIGN OUT" onClick={onSignOut} />
            ) : (
              <SignInButton text="SIGN IN" onClick={onSignIn} />
            )}
            {user ? "" : (<p className="text-center mt-3 text-sm text-gray-700">
              NEW CUSTOMER?{' '}
              <a
                href="#"
                className="text-gray-700 hover:underline hover:text-gray-900"
              >
                START HERE.
              </a>
            </p>)}

          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            {/* YOUR LISTS */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-800">
                YOUR LISTS
              </h3>
              <ul className="space-y-2">
                {[
                  'CREATE A WISH LIST',
                  'WISH FROM ANY WEBSITE',
                  'BABY WISHLIST',
                  'DISCOVER YOUR STYLE',
                  'EXPLORE SHOWROOM',
                ].map((text) => (
                  <li key={text}>
                    <a
                      href="#"
                      className="block text-gray-700 hover:underline hover:text-gray-900"
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* YOUR ACCOUNT */}
            <div>
              <h3 className="text-base font-semibold mb-3 text-gray-800">
                YOUR ACCOUNT
              </h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => router.push('/account')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR ACCOUNT
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/orders')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR ORDERS
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/wishlist')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR WISH LIST
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/recommendations')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR RECOMMENDATIONS
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/prime-membership')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR PRIME MEMBERSHIP
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/prime-video')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR PRIME VIDEO
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/subscribe-save')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR SUBSCRIBE & SAVE ITEMS
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/subscriptions')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    MEMBERSHIPS & SUBSCRIPTIONS
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/seller-account')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    YOUR SELLER ACCOUNT
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/manage-devices')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    MANAGE YOUR CONTENT AND DEVICES
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/business-register')} className="block text-left w-full text-gray-700 hover:underline hover:text-gray-900">
                    REGISTER FOR A FREE BUSINESS ACCOUNT
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
