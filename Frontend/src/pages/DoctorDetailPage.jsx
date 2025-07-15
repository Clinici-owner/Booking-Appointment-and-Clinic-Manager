import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DoctorService } from '../services/doctorService';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await DoctorService.getDoctorById(id);
        setDoctor(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        color: 'red'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div>Doctor not found</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <img 
              src={doctor.avatar || '/default-avatar.png'} 
              alt="Doctor Avatar"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '16px'
              }}
            />
            <h1 style={{ margin: '8px 0' }}>Dr. {doctor.firstName} {doctor.lastName}</h1>
            <p style={{ color: '#666', margin: '4px 0' }}>{doctor.email}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h2 style={{ marginBottom: '16px' }}>Professional Information</h2>
            <hr style={{ marginBottom: '20px' }} />

            {doctor.profile.description && (
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                <p>{doctor.profile.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ marginRight: '8px' }}>🛠️</span>
              <p style={{ margin: '0' }}>
                <strong>Experience:</strong> {doctor.profile.yearsOfExperience} years
              </p>
            </div>

            {doctor.profile.specialties.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ marginBottom: '8px' }}><strong>Specializations:</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {doctor.profile.specialties.map((specialty) => (
                    <div 
                      key={specialty._id}
                      style={{
                        border: '1px solid #007bff',
                        color: '#007bff',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '14px'
                      }}
                    >
                      {specialty.specialtyName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctor.profile.certificates.length > 0 && (
              <div>
                <p style={{ marginBottom: '8px' }}><strong>Certifications:</strong></p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {doctor.profile.certificates.map((cert) => (
                    <div key={cert._id} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>📜</span>
                      <p style={{ margin: '0' }}>
                        {cert.type} - <a href={cert.url} target="_blank" rel="noopener noreferrer">View</a>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;