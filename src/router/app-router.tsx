import { Suspense, lazy } from 'react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useCommonTranslation } from '@/lib/i18n-setup'
import { AuthProvider } from '@/lib/contexts/auth.context'
import { Toaster } from '@/components/ui/sonner'

const AppShellLayout = lazy(() =>
  import('@/router/layouts/app-shell-layout').then((mod) => ({ default: mod.AppShellLayout }))
)

const AuthRouteLayout = lazy(() =>
  import('@/router/layouts/auth-route-layout').then((mod) => ({ default: mod.AuthRouteLayout }))
)

const HomePage = lazy(() => import('@/pages/home/home-page').then((mod) => ({ default: mod.HomePage })))
const ChatPage = lazy(() => import('@/pages/chat/chat-page').then((mod) => ({ default: mod.ChatPage })))
const SignInPage = lazy(() =>
  import('@/pages/auth/sign-in-page').then((mod) => ({ default: mod.SignInPage }))
)
const SignUpPage = lazy(() =>
  import('@/pages/auth/sign-up-page').then((mod) => ({ default: mod.SignUpPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found/not-found-page').then((mod) => ({ default: mod.NotFoundPage }))
)

function RouterRoot() {
  const tCommon = useCommonTranslation()
  return (
    <AuthProvider fallback={<LoadingScreen message={tCommon('initializing')} />}>
      <Toaster />
      <Outlet />
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    element: <RouterRoot />,
    children: [
      {
        element: <AppShellLayout />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/chat',
            element: <ChatPage />,
          },
          {
            path: '/chat/:conversationId',
            element: <ChatPage />,
          },
        ],
      },
      {
        element: <AuthRouteLayout />,
        children: [
          {
            path: '/sign-in',
            element: <SignInPage />,
          },
          {
            path: '/sign-up',
            element: <SignUpPage />,
          },
        ],
      },
      {
        path: '/onboarding',
        element: <Navigate to="/sign-in" replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function AppRouter() {
  const tCommon = useCommonTranslation()
  return (
    <Suspense fallback={<LoadingScreen message={tCommon('loading')} />}>
      <RouterProvider
        router={router}
        fallbackElement={<LoadingScreen message={tCommon('loading')} />}
      />
    </Suspense>
  )
}
