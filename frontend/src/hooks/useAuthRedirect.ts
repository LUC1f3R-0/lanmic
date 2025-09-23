import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if we're not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      // Check if we're on a protected route
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/dashboard')) {
        // User not authenticated, redirecting to admin
        router.push('/admin');
      }
    }
  }, [isAuthenticated, isLoading, router]);
};
