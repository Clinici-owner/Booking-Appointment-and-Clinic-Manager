import React, { useEffect, useState } from "react";
import bookingService from '../services/bookingService';

function HealthPackageDisplayPage() {
  const [healthPackages, setHealthPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const result = await bookingService.getHealthPackages();
        if (result.success && Array.isArray(result.data)) {
          setHealthPackages(result.data);
        } else {
          setHealthPackages([]);
          setError("Không thể tải gói khám");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError("Có lỗi xảy ra khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Đang tải gói khám...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Danh sách Gói Khám Sức Khỏe</h1>

      {healthPackages.length === 0 ? (
        <p className="text-center text-gray-500">Không có gói khám nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthPackages.map((pkg) => (
            <div key={pkg._id} className="bg-white shadow rounded-lg overflow-hidden">
              <img
                src={pkg.packageImage || "/placeholder.jpg"}
                alt={pkg.packageName}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{pkg.packageName}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pkg.description || "Không có mô tả."}
                </p>
                <p className="text-blue-600 font-bold mt-2">
                  {pkg.packagePrice.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HealthPackageDisplayPage;