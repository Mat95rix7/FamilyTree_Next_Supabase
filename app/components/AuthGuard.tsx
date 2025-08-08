'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/unauthorized', '/not-found'];

// Routes nécessitant des rôles spécifiques
const PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/stats': ['admin'],
} as const;

// Composant de chargement
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
    <div
      className="w-16 h-16 border-4 border-slate-300 border-t-4 border-t-blue-500 rounded-full animate-spin mb-4"
      role="status"
      aria-label="Chargement"
    />
    <p className="text-blue-400 text-lg font-medium animate-pulse">
      Vérification des permissions...
    </p>
  </div>
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, role, isConnected, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  /**
   * Vérifie si la route actuelle est publique
   */
  const isPublicRoute = (): boolean => {
    return PUBLIC_ROUTES.some(route => 
      route === pathname || (route === '/' && pathname === route)
    );
  };

  /**
   * Vérifie si l'utilisateur a accès à une route protégée
   */
  const hasRouteAccess = (currentPath: string, userRole: string | null): boolean => {
    // Si pas de rôle, pas d'accès aux routes protégées
    if (!userRole) return false;

    // Vérifier chaque route protégée
    for (const [protectedPath, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (currentPath.startsWith(protectedPath)) {
        return allowedRoles.includes(userRole as any);
      }
    }

    // Si la route n'est pas dans les routes protégées spécifiques,
    // l'utilisateur connecté y a accès par défaut
    return true;
  };

  /**
   * Gère les redirections selon l'état d'authentification et les permissions
   */
  const handleRouteProtection = (): 'loading' | 'allowed' | 'redirect' => {
    // 1. Attendre le chargement de l'authentification
    if (isLoading) {
      return 'loading';
    }

    // 2. Routes publiques - gestion spéciale pour les pages d'auth
    if (isPublicRoute()) {
      // Si connecté et sur une page d'auth, rediriger vers l'accueil
      if (isConnected && pathname.startsWith('/auth/')) {
        if (!hasRedirected) {
          setHasRedirected(true);
          router.replace('/');
          return 'redirect';
        }
      }
      return 'allowed';
    }

    // 3. Routes protégées - utilisateur non connecté
    if (!isConnected) {
      if (!hasRedirected) {
        setHasRedirected(true);
        router.replace('/auth/login');
        return 'redirect';
      }
      return 'redirect';
    }

    // 4. Routes protégées - vérifier les permissions
    if (!hasRouteAccess(pathname, role)) {
      if (!hasRedirected) {
        setHasRedirected(true);
        router.replace('/unauthorized');
        return 'redirect';
      }
      return 'redirect';
    }

    // 5. Tout est OK, autoriser l'accès
    return 'allowed';
  };

  // Réinitialiser le flag de redirection quand le pathname change
  useEffect(() => {
    setHasRedirected(false);
  }, [pathname]);

  // Gérer la protection des routes
  const routeStatus = handleRouteProtection();

  // Afficher selon le statut
  switch (routeStatus) {
    case 'loading':
      return <LoadingScreen />;
    
    case 'redirect':
      return null; // Redirection en cours
    
    case 'allowed':
      return <>{children}</>;
    
    default:
      return <LoadingScreen />;
  }
}