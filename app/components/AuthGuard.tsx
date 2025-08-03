// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '../context/AuthContext';

// const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/unauthorized', '/not-found'];

// export default function AuthGuard({ children }: { children: React.ReactNode }) {
//   const { token } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   const [loading, setLoading] = useState(true);

//   const isPublic = PUBLIC_ROUTES.includes(pathname);

//   useEffect(() => {
//     if (token === undefined) return; // Auth context pas encore chargé

//     if (!isPublic && !token) {
//       router.replace('/unauthorized');
//     } else if (isPublic && token && pathname.startsWith('/auth')) {
//       // Empêche un utilisateur connecté d'aller sur login/register
//       router.replace('/'); // ou une page protégée par défaut
//     } else {
//       setLoading(false);
//     }
//   }, [token, pathname]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen dark-bg-animated">
//         <div
//           className="w-16 h-16 border-8 border-gray-300 border-t-8 border-t-cyan-400 rounded-full animate-spin mb-4"
//           role="status"
//           aria-label="Loading"
//         />
//         <p className="text-cyan-400 text-lg font-semibold">
//           Vérification en cours...
//         </p>
//       </div>
//     );
//   }

//   return <>{children}</>;
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/unauthorized', '/not-found'];

// ✅ Routes admin qui nécessitent des permissions spéciales
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

  const [loading, setLoading] = useState(true);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // ✅ Vérifier si la route nécessite des permissions admin
  const checkAdminAccess = (pathname: string, userRole: string | null) => {
    for (const [adminRoute, allowedRoles] of Object.entries(ADMIN_ROUTES)) {
      if (pathname.startsWith(adminRoute)) {
        return userRole && allowedRoles.includes(userRole);
      }
    }
    return true; // Pas une route admin, accès autorisé
  };

  useEffect(() => {
    // Attendre que le contexte auth soit chargé
    if (isLoading) {
      setLoading(true);
      return;
    }

    // Route publique - toujours accessible
    if (isPublic) {
      // Empêche un utilisateur connecté d'aller sur login/register
      if (isConnected && pathname.startsWith('/auth/')) {
        router.replace('/');
        return;
      }
      setLoading(false);
      return;
    }

    // Route protégée - vérifier la connexion
    if (!isConnected) {
      router.replace('/unauthorized');
      return;
    }

    // ✅ Vérifier les permissions admin si nécessaire
    if (!checkAdminAccess(pathname, role)) {
      router.replace('/unauthorized');
      return;
    }

    setLoading(false);
  }, [isLoading, isConnected, role, pathname, isPublic, router, token]);

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