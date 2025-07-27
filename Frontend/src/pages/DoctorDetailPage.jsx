import React, { useEffect, useState } from 'react';
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
      <div className="flex justify-center items-center h-[60vh]">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500">
        <div>{error}</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div>Doctor not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 md:flex gap-8">
        {/* Left - Avatar */}
        <div className="md:w-1/3 flex flex-col items-center border-r border-gray-200">
          <img
            src={doctor.avatar || '/default-avatar.png'}
            alt="Doctor Avatar"
            className="w-64 h-80 object-cover rounded-lg shadow-md"
          />
          <div className="mt-4 text-center">
            <h1 className="text-xl font-bold">Bác sĩ {doctor.fullName}</h1>
            <p className="text-gray-500">{doctor.email}</p>
          </div>
        </div>

        {/* Right - Info */}
        <div className="md:w-2/3 mt-6 md:mt-0 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Giới thiệu</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-line">
              <span dangerouslySetInnerHTML={{ __html: doctor.profile.description }} />
            </p>
          </div>

          {/* Experience & Specialty on single lines */}
          <div className="space-y-3">
            {/* Experience */}
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-semibold">Kinh nghiệm:</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {doctor.profile.yearsOfExperience} năm
              </span>
            </div>

            {/* Specialties */}
            {doctor.profile.specialties.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-800 font-semibold">Chuyên môn:</span>
                {doctor.profile.specialties.map((spec) => (
                  <span
                    key={spec._id}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {spec.specialtyName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          {doctor.profile.certificateId.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Chứng chỉ</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 list-none">
                {doctor.profile.certificateId.map(cert => (
                  <li key={cert._id}>
                    {cert.type}{' '}
                    {cert.file_path && (
                      <img
                        src={cert.file_path}
                        className="text-blue-600 underline hover:text-blue-800"
                        target="_blank"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
