import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorService } from '../services/doctorService';

const DoctorListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await DoctorService.getAllDoctors();
        
        if (!result.success || !result.doctors) {
          throw new Error('Failed to load doctors');
        }
        
        setDoctors(result.doctors);
        setFilteredDoctors(result.doctors);
        
        // Trích xuất danh sách chuyên khoa duy nhất
        const uniqueSpecialties = extractUniqueSpecialties(result.doctors);
        setSpecialties(uniqueSpecialties);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Hàm trích xuất chuyên khoa duy nhất
  const extractUniqueSpecialties = (doctorsList) => {
    const specialtyMap = new Map();
    
    doctorsList.forEach(doctor => {
      doctor.profile?.specialties?.forEach(spec => {
        if (spec?._id && !specialtyMap.has(spec._id)) {
          specialtyMap.set(spec._id, {
            _id: spec._id,
            name: spec.specialtyName,
            logo: spec.logo
          });
        }
      });
    });
    
    return Array.from(specialtyMap.values());
  };

  // Lọc bác sĩ theo chuyên khoa
  useEffect(() => {
    if (selectedSpecialty === 'all') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor => 
        doctor.profile?.specialties?.some(spec => spec._id === selectedSpecialty)
      );
      setFilteredDoctors(filtered);
    }
  }, [selectedSpecialty, doctors]);

  const handleViewDetail = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h3 className="text-xl font-semibold mb-2">Error Loading Doctors</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Doctors</h1>
      
      {/* Bộ lọc chuyên khoa */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="specialty-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Specialty:
            </label>
            <select
              id="specialty-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty._id} value={specialty._id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-gray-500 text-sm">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </div>
      </div>

      {/* Danh sách bác sĩ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={doctor.avatar || '/default-avatar.jpg'}
                    alt={`${doctor.fullName}`}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{doctor.fullName}</h2>
                    <p className="text-blue-600 text-sm">
                      {doctor.profile?.yearsOfExperience || 0} years experience
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {doctor.profile?.description || "Professional doctor"}
                </p>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.profile?.specialties?.map(specialty => (
                      <span 
                        key={specialty._id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {specialty.specialtyName}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetail(doctor._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-gray-500">Try changing your filter criteria</p>
            <button
              onClick={() => setSelectedSpecialty('all')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListPage;