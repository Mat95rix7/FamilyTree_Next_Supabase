'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/unauthorized', '/not-found'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (token === undefined) return; // Auth context pas encore chargé

    if (!isPublic && !token) {
      router.replace('/unauthorized');
    } else if (isPublic && token && pathname.startsWith('/auth')) {
      // Empêche un utilisateur connecté d'aller sur login/register
      router.replace('/'); // ou une page protégée par défaut
    } else {
      setLoading(false);
    }
  }, [token, pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark-bg-animated">
        <div
          className="w-16 h-16 border-8 border-gray-300 border-t-8 border-t-cyan-400 rounded-full animate-spin mb-4"
          role="status"
          aria-label="Loading"
        />
        <p className="text-cyan-400 text-lg font-semibold">
          Vérification en cours...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
