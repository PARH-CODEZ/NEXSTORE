import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'ZZZZZZZZZZZZ');

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  let user = null;

  try {
    if (token) {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload; // contains userid and role
      console.log('✅ JWT verified:', payload);
    } else {
      console.log('⚠️ No token found, treating as guest');
    }
  } catch (err) {
    console.error('❌ Invalid JWT:', err.message);
    // Invalid token, treat as guest
  }

  const loginPages = ['/login', '/admin-login', '/seller-login'];
  const guestRoutes = ['/', '/category', '/products', '/login', '/admin-login', '/seller-login', '/orders', '/cart'];
  const customerOnlyRoutes = ['/cart', '/orders', '/checkout'];
  const sellerOnlyRoutes = ['/catlogue', '/manageproducts', '/seller-orders', '/seller-products'];
  const sharedAuthenticatedRoutes = ['/', '/category', '/products', '/account'];

  const matchPath = (routes, path) => {
    return routes.some(route => path === route || path.startsWith(route + '/'));
  };

  // 1. GUEST access
  if (!user) {
    if (loginPages.includes(pathname)) return NextResponse.next();

    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }

    if (pathname === '/checkout') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (matchPath(sellerOnlyRoutes, pathname)) {
      return NextResponse.redirect(new URL('/seller-login', req.url));
    }

    if (matchPath(guestRoutes, pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated user
  const role = user.role;

  if (loginPages.includes(pathname)) {
    if (role === 'customer') return NextResponse.redirect(new URL('/', req.url));
    if (role === 'seller') return NextResponse.redirect(new URL('/seller-orders', req.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  if (role === 'customer') {
    if (matchPath(sellerOnlyRoutes, pathname) || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (matchPath(customerOnlyRoutes, pathname) || matchPath(sharedAuthenticatedRoutes, pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (role === 'seller') {
    if (matchPath(customerOnlyRoutes, pathname) || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/seller-orders', req.url));
    }
    if (matchPath(sellerOnlyRoutes, pathname) || matchPath(sharedAuthenticatedRoutes, pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/seller-orders', req.url));
  }

  if (role === 'admin') {
    if (pathname === '/admin/dashboard' || pathname.startsWith('/admin') || pathname === '/category' || pathname === '/products') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

// --- MATCHER ---
export const config = {
  matcher: [
    '/',
    '/login',
    '/cart/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/category/:path*',
    '/products/:path*',
    '/admin',
    '/admin/:path*',
    '/admin-login',
    '/seller-login',
    '/catlogue/:path*',
    '/manageproducts/:path*',
    '/seller-orders/:path*',
    '/seller-products/:path*',
    '/account/:path*',
  ]
};
