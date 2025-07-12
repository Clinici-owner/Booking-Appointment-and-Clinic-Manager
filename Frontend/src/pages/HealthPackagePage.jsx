"use client";

import { useEffect, useState } from "react";
import { healthPackageService } from "../services/healthPackageService";
import HealthPackageList from "../components/HealthPackageList";
import BannerName from "../components/BannerName";

function HealthPackagePage() {
  const [user, setUser] = useState(null);
  const [healthPackages, setHealthPackages] = useState([]); // Khởi tạo với array rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(""); // Reset error

      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const result = await healthPackageService.getAllHealthPackages();

      // Kiểm tra kết quả API
      if (result && result.data && Array.isArray(result.data)) {
        setHealthPackages(result.data);
      } else {
        console.warn("API response format unexpected:", result);
        setHealthPackages([]); // Set array rỗng nếu data không hợp lệ
        setError("Định dạng dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setHealthPackages([]); // Set array rỗng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPackages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BannerName Text="Chuyên khoa" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HealthPackageList
          user={user}
          healthPackages={healthPackages}
          showDeleteButton={false}
          showToggleButton={false}
          showDetailButton={false} // Ẩn nút chi tiết cho user thường
        />
      </div>
    </div>
  );
}

export default HealthPackagePage;
