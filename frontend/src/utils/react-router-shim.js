'use client';
import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function Link({ to, href, children, ...props }) {
  const target = href || to || '/';
  return (
    <NextLink href={target} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (url) => {
    if (typeof url === 'number') {
      if (url === -1) router.back();
    } else if (url) {
      router.push(url);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname: pathname || '/', search: '', hash: '', state: null };
}

export function useParams() {
  return {};
}

export function useSearchParamsHook() {
  const searchParams = useSearchParams();
  return [searchParams, () => {}];
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();
  useEffect(() => {
    if (to) {
      if (replace) router.replace(to);
      else router.push(to);
    }
  }, [to, replace, router]);
  return null;
}

export function Outlet() {
  return null;
}
