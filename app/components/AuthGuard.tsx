'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/unauthorized', '/not-found'];

const ADMIN_ROUTES = {
  '/admin': ['admin', 'superadmin'],
  '/admin/users': ['admin', 'superadmin'],
  '/admin/settings': ['superadmin'],
  '/moderator': ['moderator', 'admin', 'superadmin'],
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, role, isConnected, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const checkAdminAccess = (pathname: string, userRole: string | null) => {
    for (const [adminRoute, allowedRoles] of Object.entries(ADMIN_ROUTES)) {
      if (pathname.startsWith(adminRoute)) {
        return userRole && allowedRoles.includes(userRole);
      }
    }
    return true;
  };

  // ✅ 1. Pas besoin d'attendre isLoading si c'est une page publique
  if (isPublic) {
    if (isConnected && pathname.startsWith('/auth/')) {
      router.replace('/');
      return null;
    }
    return <>{children}</>; // ✅ Pas de loading spinner
  }

  // ✅ 2. Auth non encore chargée, attendre
  if (isLoading) {
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

  // ✅ 3. Auth chargée — mais utilisateur non connecté
  if (!isConnected) {
    router.replace('/unauthorized');
    return null;
  }

  // ✅ 4. Auth chargée — utilisateur connecté mais mauvais rôle
  if (!checkAdminAccess(pathname, role)) {
    router.replace('/unauthorized');
    return null;
  }

  return <>{children}</>;
}
