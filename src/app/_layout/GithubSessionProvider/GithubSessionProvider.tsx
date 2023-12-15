'use client';

import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';

interface GithubSessionProviderProps {
  children: ReactNode;
}
export const GithubSessionProvider: FC<GithubSessionProviderProps> = ({
  children
}) => {
  return <SessionProvider refetchInterval={60 * 60 * 4} refetchOnWindowFocus basePath='/napi/auth'>
    {children}
  </SessionProvider>;
}