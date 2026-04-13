'use client'

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // detect navigation: when pathname/searchParams change, the navigation completed
  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // intercept link clicks to start the progress bar
  const handleClick = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href) return;

    // skip external, anchor, tel, mailto links
    if (target.target === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('obyte:') || href.startsWith('javascript:')) return;

    // skip if same page
    const url = new URL(href, window.location.origin);
    if (url.pathname === pathname && url.search === window.location.search) return;

    setLoading(true);
    setProgress(20);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  // trickle: slowly increase progress while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.1;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [loading]);

  if (progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '3px',
        backgroundColor: '#0137FF',
        zIndex: 99999,
        transition: loading ? 'width 300ms ease' : 'width 200ms ease, opacity 300ms ease 100ms',
        opacity: progress >= 100 ? 0 : 1,
      }}
    />
  );
}
