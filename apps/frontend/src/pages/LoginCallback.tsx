import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [hasCalledLogin, setHasCalledLogin] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && !hasCalledLogin) {
      setHasCalledLogin(true);
      login(token);
    } else if (!token) {
      navigate('/login');
    }
  }, [searchParams, navigate, login, hasCalledLogin]);

  // Wait for user to be set after login
  useEffect(() => {
    if (hasCalledLogin && user) {
      navigate('/upload');
    }
  }, [user, hasCalledLogin, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
