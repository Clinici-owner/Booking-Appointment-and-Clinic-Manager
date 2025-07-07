import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"
import HealthPackageList from "../components/HealthPackageList"

function AdminHealthPackagePage() {
  const [healthPackages, setHealthPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const result = await healthPackageService.getAllHealthPackages()
      setHealthPackages(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPackages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Quản Lý Gói Khám Sức Khỏe</h1>
              <p className="text-blue-100 mt-2">Quản lý và theo dõi các gói khám sức khỏe trong hệ thống</p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin/health-packages/create")}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center shadow-lg"
            >
              <span className="mr-2">➕</span>
              Tạo gói khám bệnh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Tổng gói khám */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng gói khám</p>
                <p className="text-2xl font-bold text-gray-900">{healthPackages.length}</p>
              </div>
            </div>
          </div>

          {/* Đang hoạt động */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthPackages.filter((pkg) => pkg?.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          {/* Giá cao nhất - Fixed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-red-600 text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giá cao nhất</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthPackages.length > 0
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Math.max(...healthPackages.map((pkg) => pkg?.packagePrice || 0)))
                    : "0 ₫"}
                </p>
              </div>
            </div>
          </div>

          {/* Giá trung bình */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthPackages.length > 0
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        healthPackages.reduce((sum, pkg) => sum + (pkg?.packagePrice || 0), 0) / healthPackages.length,
                      )
                    : "0 ₫"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh sách Gói Khám</h2>
                <p className="text-sm text-gray-600 mt-1">Hiển thị {healthPackages.length} gói khám trong hệ thống</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {healthPackages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói khám nào</h3>
                <p className="text-gray-600 mb-6">Bắt đầu bằng cách tạo gói khám sức khỏe đầu tiên</p>
              </div>
            ) : (
              <HealthPackageList healthPackages={healthPackages} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHealthPackagePage
