import { Suspense } from 'react';
import { PageLoader } from './PageLoader';

export function Lazy({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

