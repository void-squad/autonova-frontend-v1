import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function OAuth2Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract query parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const error = urlParams.get('error');

    // Handle error case
    if (error) {
      console.error('OAuth2 authentication error:', error);
      navigate('/login', { 
        state: { 
          error: 'Google login failed. Please try again.' 
        } 
      });
      return;
    }

    // Validate required parameters
    if (!token || !refreshToken || !userId || !email || !role) {
      console.error('Missing required OAuth2 parameters');
      navigate('/login', { 
        state: { 
          error: 'Authentication failed. Missing required information.' 
        } 
      });
      return;
    }

    try {
      // Store authentication data in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userInfo', JSON.stringify({
        id: userId,
        email: email,
        role: role
      }));

      // Navigate based on user role
      switch (role.toUpperCase()) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'EMPLOYEE':
          navigate('/employee/dashboard');
          break;
        case 'CUSTOMER':
          navigate('/customer/dashboard');
          break;
        default:
          console.warn('Unknown role:', role);
          navigate('/');
          break;
      }
    } catch (err) {
      console.error('Error processing OAuth2 callback:', err);
      navigate('/login', { 
        state: { 
          error: 'Failed to complete authentication. Please try again.' 
        } 
      });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">
          Completing Sign In...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
}
