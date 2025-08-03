// components/ProtectedPage.js
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function ProtectedPage({ children, requiredRole = null }) {
  const { username, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!username) {
      router.replace('/');
    } else if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
      router.replace('/');
    }
  }, [username, router, requiredRole, role]);

  if (!username) return null; 
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) return null;

  return children;
}
