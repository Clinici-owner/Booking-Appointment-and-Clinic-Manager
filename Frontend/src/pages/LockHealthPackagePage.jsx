import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"

function LockHealthPackagePage() {
  const [healthPackages, setHealthPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchHealthPackages()
  }, [])

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

  const handleToggleStatus = async (packageId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [packageId]: true }))
      setError("")

      const response = await healthPackageService.togglePackageStatus(packageId)

      if (response.success) {
        // Update local state
        setHealthPackages((prev) =>
          prev.map((pkg) =>
            pkg._id === packageId ? { ...pkg, status: response.data.status, updatedAt: response.data.updatedAt } : pkg,
          ),
        )

        // Show success message briefly
        const statusText = response.data.status === "active" ? "kích hoạt" : "vô hiệu hóa"
        // You could add a toast notification here
        console.log(`${statusText.charAt(0).toUpperCase() + statusText.slice(1)} gói khám thành công`)
      } else {
        setError(response.message || "Có lỗi xảy ra khi thay đổi trạng thái")
      }
    } catch (err) {
      console.error("Error toggling package status:", err)
      setError(err.message || "Có lỗi xảy ra khi thay đổi trạng thái")
    } finally {
      setActionLoading((prev) => ({ ...prev, [packageId]: false }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const getStatusColor = (status) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (status) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động"
  }

  const getActionButtonStyle = (status) => {
    return status === "active" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
  }

  const getActionButtonText = (status) => {
    return status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Quản Lý Trạng Thái Gói Khám</h1>
              <p className="text-purple-100 mt-2">Kích hoạt hoặc vô hiệu hóa gói khám sức khỏe</p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin/health-packages")}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">←</span>
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800">
              <span className="mr-3 text-xl">⚠️</span>
              <div>
                <h3 className="font-medium">Có lỗi xảy ra</h3>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={fetchHealthPackages}
                  className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors duration-200"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthPackages.filter((pkg) => pkg?.status === "nonactive").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách Gói Khám</h3>
            <p className="text-sm text-gray-600 mt-1">Quản lý trạng thái hoạt động của các gói khám</p>
          </div>

          <div className="overflow-x-auto">
            {healthPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <span className="text-6xl mb-4">📦</span>
                <h3 className="text-lg font-medium mb-2">Không có dữ liệu</h3>
                <p className="text-sm">Chưa có gói khám nào được tạo</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gói khám
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cập nhật lần cuối
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthPackages.map((pkg, index) => (
                    <tr key={pkg?._id || index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                              src={pkg?.packageImage || "https://via.placeholder.com/48x48?text=IMG"}
                              alt={pkg?.packageName || "Package"}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/48x48?text=IMG"
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pkg?.packageName || "N/A"}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {pkg?.description || "Không có mô tả"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatPrice(pkg?.packagePrice)}</div>
                        <div className="text-sm text-gray-500">{pkg?.service?.length || 0} dịch vụ</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            pkg?.status,
                          )}`}
                        >
                          {getStatusText(pkg?.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(pkg?.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(pkg._id)}
                          disabled={actionLoading[pkg._id]}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonStyle(
                            pkg?.status,
                          )}`}
                        >
                          {actionLoading[pkg._id] ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            getActionButtonText(pkg?.status)
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default LockHealthPackagePage
