import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Lazy } from '@/components/Lazy';

const HomePage = lazy(() => import('@/pages/Home/index'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/index'));

/**
 * Router Configuration
 *
 * AI Agent Usage Guide:
 * 1. Add new page routes here (before the 404 route)
 * 2. Use lazy() for code splitting
 * 3. Wrap all lazy-loaded components with <Lazy>
 * 4. The 404 route must be last (path: '*')
 */
export const router = createBrowserRouter([
  // AI Agent: Add new page routes here
  {
    path: '/',
    element: (
      <Lazy>
        <HomePage />
      </Lazy>
    ),
  },

  // 404 fallback route (must be kept at the end)
  {
    path: '*',
    element: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
  },
]);
