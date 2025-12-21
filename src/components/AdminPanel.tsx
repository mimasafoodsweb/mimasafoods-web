import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('Login successful:', data.user?.email);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mimasa-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mimasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mimasa-deep text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} error={error} isLoading={isLoading} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}
