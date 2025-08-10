import { NextResponse } from 'next/server';

export function middleware(request) {
  // const token = request.cookies.get('sb-auth-token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookieStr => {
      const [name, ...rest] = cookieStr.split('=');
      const value = rest.join('=');
      return [name, value];
    })
  );

  let token;
  for (const [name, value] of Object.entries(cookies)) {
    if (name.startsWith('sb-') && name.endsWith('auth-token')) {
      token = value;
      break;
    }
  }
  const role = request.cookies.get('sb-user-role')?.value;
  const pathname = request.nextUrl.pathname;

  console.log(`Middleware: ${pathname}, Token: ${token ? 'Présent' : 'Absent'}, Role: ${role || 'Inconnu'}`);

  // Routes publiques accessibles sans token
  const publicRoutes = ['/', '/unauthorized', '/auth/login', '/auth/register', '/not-found'];
  if (publicRoutes.includes(pathname)) {
    console.log('Route publique, poursuivre');
    return NextResponse.next();
  }

  // Pour les routes protégées, vérifier le token
  if (!token || !role) {
    console.log('Pas de token ou rôle, redirection vers /auth/login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Vérification simple d'expiration du token si tu veux la garder (optionnel)
  if (isTokenExpired(token)) {
    console.log('Token expiré');
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('sb-auth-token');
    response.cookies.delete('sb-user-role');
    return response;
  }

  const isAdminPage = pathname.startsWith('/admin');
  const isUserPage = pathname.startsWith('/personnes') || pathname.startsWith('/familles');

  console.log(`Utilisateur: ${role}, Page: ${pathname}`);

  // Gestion des accès selon le rôle
  if (role === 'user') {
    if (isAdminPage) {
      console.log('User tentant d\'accéder à une page admin');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (!isUserPage) {
      console.log('User tentant d\'accéder à une page non autorisée');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Admin a accès à tout, on autorise l'accès
  return NextResponse.next();
}

// Comme tu n'as plus le token décodé, il faut une fonction qui vérifie expiration autrement
// Soit tu gardes la vérification dans le token JWT (tu peux décoder sans rôle), soit tu la supprimes
// Pour l'exemple, je fais une vérif simple qui retourne false (pas expiré)
function isTokenExpired(token) {
  // Optionnel : décoder le token pour vérifier exp, si besoin
  // Si tu veux, tu peux garder le jwtDecode ici pour vérifier l'expiration uniquement

  // Par exemple (si tu veux garder cette partie, il faudra réimporter jwtDecode) :
  /*
  import jwtDecode from 'jwt-decode';
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true; // token invalide -> expiré
  }
  */
  
  return false; // Pour l'instant on suppose que le token est valide
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};