import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        sessionStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login', { state: { error: 'Failed to process Google login' } });
      }
    } else {
      navigate('/login', { state: { error: 'Google login failed' } });
    }
  }, [navigate]);

  return <div>Processing Google login...</div>;
};

export default GoogleAuthCallback;