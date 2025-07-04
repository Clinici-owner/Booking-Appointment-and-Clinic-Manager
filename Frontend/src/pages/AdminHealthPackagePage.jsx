import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"

 function AdminHealthPackagePage() {
  const [healthPackages, setHealthPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchHealthPackages = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await healthPackageService.getAllHealthPackagesAdmin()

      if (response?.success) {
        setHealthPackages(Array.isArray(response.data) ? response.data : [])
      } else {
        setHealthPackages([])
      }
    } catch (err) {
      console.error("Error fetching health packages:", err)
      setError(err.message || "Không thể tải dữ liệu")
      setHealthPackages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthPackages()
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
            onClick={fetchHealthPackages}
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
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">GÓI KHÁM SỨC KHỎE</h1>
          <p className="text-xl text-white/90">Chăm sóc sức khỏe toàn diện cho bạn và gia đình</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {healthPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói khám nào</h3>
            <p className="text-gray-600">Hiện tại chưa có gói khám sức khỏe nào được tạo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {healthPackages.map((pkg, index) => (
              <div
                key={pkg?._id || index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200"
              >
                {/* Package Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
                  <img
                    src={pkg?.packageImage || "https://via.placeholder.com/300x200?text=Gói+Khám"}
                    alt={pkg?.packageName || "Package"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Gói+Khám"
                    }}
                  />
                </div>

                {/* Package Content */}
                <div className="p-6">
                  {/* Package Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {pkg?.packageName || "Tên gói khám"}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-4">
                    {pkg?.description || "Mô tả gói khám sức khỏe"}
                  </p>

                  {/* Detail Button */}
                  <button
                    onClick={() => (window.location.href = `/admin/health-packages/detail/${pkg?._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{healthPackages.length}</div>
              <div className="text-gray-600">Tổng gói khám</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {healthPackages.filter((pkg) => pkg?.status === "active").length}
              </div>
              <div className="text-gray-600">Đang hoạt động</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {healthPackages.filter((pkg) => pkg?.status === "nonactive").length}
              </div>
              <div className="text-gray-600">Không hoạt động</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminHealthPackagePage