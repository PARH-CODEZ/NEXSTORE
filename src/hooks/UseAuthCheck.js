import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/store/userSlice';
import { toast } from 'react-toastify';

export function useAuthCheck() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
        });

        const data = await res.json();

        if (res.ok && data.user) {
          dispatch(setUser(data.user));
      
        
        } else {
          dispatch(clearUser());
        }
      } catch {
        dispatch(clearUser());
      
      }
    }

    checkAuth();
  }, [dispatch]);
}
