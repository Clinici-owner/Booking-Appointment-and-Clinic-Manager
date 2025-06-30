import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '../services/doctorService';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get('user');
        
        if (!userParam) {
          throw new Error('Missing user parameter');
        }

        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Validate user data
        if (!userData || !userData._id || !userData.role) {
          throw new Error('Invalid user data');
        }

        sessionStorage.setItem('user', JSON.stringify({
          ...userData,
          expiresAt: Date.now() + 3600000 // 1 hour expiration
        }));

        switch (userData.role) {
          case 'admin':
            navigate('/admin/staffs');
            break;
          case 'doctor':
            try {
              const doctorProfile = await DoctorService.getDoctorProfileById(userData._id);
              navigate(doctorProfile ? '/' : '/doctor/createDoctorProfile');
            } catch (error) {
              console.error('Error checking doctor profile:', error);
              navigate('/doctor/createDoctorProfile', {
                state: { error: 'Failed to verify doctor profile' }
              });
            }
            break;
          default:
            navigate('/');
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        navigate('/login', { 
          state: { 
            error: error.message || 'Failed to process Google login' 
          } 
        });
      }
    };

    handleGoogleAuth();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-semibold">
        Processing Google login...
      </div>
    </div>
  );
};

export default GoogleAuthCallback;