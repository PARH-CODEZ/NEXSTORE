'use client';

import { useAuthCheck } from "@/hooks/UseAuthCheck";

export default function AuthInitializer({ children }) {
  useAuthCheck(); // Runs on app start to populate redux user

  return children;
}
