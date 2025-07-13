import React, { useEffect, useState } from "react";

import { getSpecialtyById } from "../services/specialtyService";

import { Link, useParams, useNavigate } from "react-router-dom";
import BannerName from "../components/BannerName";

function SpecialtyDetailPage() {
  const { id } = useParams();
  const [specialty, setSpecialty] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialty = async () => {
      const data = await getSpecialtyById(id);
      setSpecialty(data);
    };
    fetchSpecialty();
  }, [id]);

  if (!specialty) {
    return <div>Loading...</div>;
  }

  const handleBookAppointment = () => {
    // Logic to handle booking appointment
    navigate(`/appointment-specialty/${id}`, {
      state: {
        typeAppointment: "specialty",
      },
    });
  }

  return (
    <div className="">
      <BannerName Text={`KHOA ${specialty.specialtyName} `} />

      <div className="flex flex-col md:flex-row items-start justify-between p-4 gap-8 mt-4 px-10">
        {/* Cột trái: Thông tin chuyên khoa */}
        <div className="w-full md:w-2/3">
          {specialty.documentId.map((doc) => (
            <div key={doc._id} className="mb-4">
              <img
                src={doc.file_path}
                alt={specialty.specialtyName}
                className="w-full object-cover h-140 rounded-lg shadow-md mb-2"
              />
            </div>
          ))}
          <div className="mb-4">
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: specialty.descspecialty }}
            ></p>
          </div>
        </div>

        {/* Cột phải: Bác sĩ trưởng khoa */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2 text-custom-blue">
              Bác sĩ trưởng khoa
            </h3>
            <img
              src={specialty.chiefPhysician?.avatar || "default-avatar.png"}
              alt=""
              className=" rounded-lg mb-4"
            />
            <p className="text-gray-700 mb-2">Bác sĩ trưởng khoa</p>
            <p className="mb-4 font-bold">
              {specialty.chiefPhysician?.fullName}
            </p>
          </div>
          <div className="flex justify-center pt-4 items-center">
            <button
              onClick={handleBookAppointment}
              className="bg-custom-blue text-white px-10 py-4 rounded-xl shadow-2xl hover:shadow-blue-300 hover:scale-105 transition-transform duration-300"
            >
              Đặt lịch khám ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialtyDetailPage;
