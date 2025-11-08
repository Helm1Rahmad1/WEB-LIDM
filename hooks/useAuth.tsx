'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  userId: string;
  name: string;
  email: string;
  role: 'guru' | 'murid';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    // Prevent double initialization
    if (isInitialized) {
      console.log('⏭️ Auth already initialized, skipping check');
      return;
    }
    
    // Skip check if user is already set (from login)
    if (user) {
      console.log('⏭️ User already set, skipping auth check');
      setLoading(false);
      setIsInitialized(true);
      return;
    }
    
    const checkAuthStatus = async () => {
      console.log('🔍 Checking auth status...');
      
      // First check localStorage
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        console.log('ℹ️ No token in localStorage');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      try {
        // Try to get user info
        const userData = await authApi.getUser();
        if (userData) {
          console.log('✅ User found in session:', userData.email);
          setUser({
            userId: userData.user_id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        } else {
          console.log('ℹ️ No user session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth verification error:', error);
        // User is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, [isInitialized, user]);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      
      if (data.token) {
        console.log('✅ Login API successful, storing user data...');
        
        // Store token in localStorage for API requests
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        
        // Store user info in context directly from login response
        const userData = {
          userId: data.user.user_id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        // Set user and mark as initialized BEFORE navigation
        setUser(userData);
        setToken(data.token);
        setLoading(false);
        setIsInitialized(true);
        
        console.log('✅ User state updated:', userData.email);
        
        // Directly redirect to role-specific dashboard (skip intermediate /dashboard)
        const targetUrl = userData.role === 'guru' ? '/dashboard/guru' : '/dashboard/murid';
        console.log('➡️ Direct redirect to:', targetUrl);
        
        // Use replace instead of href to avoid adding to history
        window.location.replace(targetUrl);
      }
    } catch (error: any) {
      // Re-throw the error to be handled by the calling component
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear server-side session if needed
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear all client-side auth state
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      router.push('/auth/login');
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role: string }) => {
    try {
      await authApi.register(userData);
    } catch (error: any) {
      throw error;
    }
  };

  const verifyToken = async () => {
    try {
      const userData = await authApi.getUser();
      if (userData) {
        setUser({
          userId: userData.user_id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}