"use client";
import { useAuth } from "../app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const { role, isConnected } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attendre que l'état d'authentification soit initialisé
    if (role === undefined || isConnected === undefined) {
      return;
    }

    setIsLoading(false);

    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isConnected) {
      if (pathname !== "/") {
        router.replace("/");
      }
      return;
    }

    // Définir les routes autorisées selon le rôle
    const isLoginPage = pathname === "/";
    const isAdminPage = pathname.startsWith("/admin");
    const isUserAllowedPage = pathname.startsWith("/personnes") || pathname.startsWith("/familles");
    const isUnauthorizedPage = pathname === "/unauthorized";

    // Si l'utilisateur est connecté et sur la page de connexion, rediriger
    if (isConnected && isLoginPage) {
      if (role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/personnes");
      }
      return;
    }

    // Vérifications selon le rôle
    if (role === "admin") {
      // L'admin peut accéder à toutes les pages sauf login
      if (isLoginPage) {
        router.replace("/admin");
      }
    } else if (role === "user") {
      // L'utilisateur ne peut accéder qu'aux pages autorisées
      if (isAdminPage) {
        router.replace("/unauthorized");
      } else if (!isUserAllowedPage && !isUnauthorizedPage) {
        router.replace("/unauthorized");
      }
    } else {
      // Rôle inconnu - rediriger vers une page sécurisée
      router.replace("/unauthorized");
    }
  }, [isConnected, role, pathname, router]);

  // Afficher un loading pendant la vérification d'authentification
  if (isLoading || role === undefined || isConnected === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si pas connecté et pas sur la page de login, ne rien afficher (redirection en cours)
  if (!isConnected && pathname !== "/") {
    return null;
  }

  return <>{children}</>;
}