'use client'
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '@/store/userSlice';

export default function Profile() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  if (!user) return <p>Not logged in</p>;

  return (
    <>
      <p>Role: {user.role}</p>
      <p>Phone: {user.phone}</p>
      <button onClick={() => dispatch(clearUser())}>Logout</button>
    </>
  );
}
