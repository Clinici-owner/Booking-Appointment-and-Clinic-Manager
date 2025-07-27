import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { healthPackageService } from "../services/healthPackageService";
import { useNavigate } from "react-router-dom";

function HealthPackageDetailPatientPage() {
  const { id } = useParams();
  const [packageDetail, setPackageDetail] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        const response = await healthPackageService.getHealthPackageById(id);
        setPackageDetail(response.data);
      } catch (error) {
        console.error("Error fetching package detail:", error);
      }
    };

    fetchPackageDetail();
  }, [id]);

  const handleBooking = () => {
    navigate("/appointment-specialty/" + packageDetail.specialties[0]._id, {
        state: {
            typeAppointment: "healthPackage",
            healthPackageId: packageDetail._id,
        }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 mb-10">
      <button
        className="fixed bottom-6 right-16 md:right-30 flex items-center gap-3 px-6 py-3
             bg-gradient-to-r from-blue-500 to-blue-700 text-white
             rounded-full shadow-xl text-base font-semibold
             hover:scale-105 hover:shadow-2xl hover:from-blue-600 hover:to-blue-800
             active:scale-95 transition-all duration-300 z-50"
        onClick={() => {
          handleBooking();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Đặt lịch ngay</span>
      </button>

      {packageDetail ? (
        <div className="space-y-6">
          <h1 className="text-[28px] font-bold text-custom-blue text-center">
            {packageDetail.packageName}
          </h1>

          <img
            src={packageDetail.packageImage}
            alt={packageDetail.packageName}
            className="mx-auto w-full max-h-[400px] object-cover rounded-xl shadow"
          />

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Mô tả gói khám
          </h3>
          <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: packageDetail.description }}></p>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Danh sách dịch vụ:
            </h3>
            {packageDetail.service && packageDetail.service.length > 0 ? (
              <ul className="space-y-2">
                {packageDetail.specialties && packageDetail.specialties.length > 0 ? (
                  packageDetail.specialties.map((specialty) => (
                    <li
                      key={specialty._id}
                      className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 transition"
                    >
                      Khám tổng quát: {specialty.specialtyName}
                    </li>
                  ))
                ) : null}
                {packageDetail.service.map((service) => (
                  <li
                    key={service._id}
                    className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 transition"
                  >
                    {service.paraclinalName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                Không có dịch vụ nào trong gói khám này.
              </p>
            )}
          </div>

          <p className="text-xl font-bold text-green-600">
            Giá: {packageDetail.packagePrice.toLocaleString()} VND
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      )}
    </div>
  );
}

export default HealthPackageDetailPatientPage;
