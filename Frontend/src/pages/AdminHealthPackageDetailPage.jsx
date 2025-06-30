import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"

function AdminHealthPackageDetailPage({ packageId }) {
  const [healthPackage, setHealthPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lockLoading, setLockLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Add debugging
    console.log("PackageId received:", packageId)

    if (packageId) {
      fetchHealthPackageDetail()
    } else {
      // If no packageId, try to get from URL
      const urlParts = window.location.pathname.split("/")
      const idFromUrl = urlParts[urlParts.length - 1]
      console.log("ID from URL:", idFromUrl)

      if (idFromUrl && idFromUrl !== "detail") {
        fetchHealthPackageDetailById(idFromUrl)
      } else {
        setError("Không tìm thấy ID gói khám")
        setLoading(false)
      }
    }
  }, [packageId])

  const fetchHealthPackageDetail = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Fetching package with ID:", packageId)

      const response = await healthPackageService.getHealthPackageById(packageId)
      console.log("API Response:", response)

      if (response && response.success) {
        setHealthPackage(response.data)
      } else {
        setError(response?.message || "Không thể tải thông tin gói khám")
      }
    } catch (err) {
      console.error("Error fetching health package detail:", err)
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthPackageDetailById = async (id) => {
    try {
      setLoading(true)
      setError("")
      console.log("Fetching package with ID from URL:", id)

      const response = await healthPackageService.getHealthPackageById(id)
      console.log("API Response:", response)

      if (response && response.success) {
        setHealthPackage(response.data)
      } else {
        setError(response?.message || "Không thể tải thông tin gói khám")
      }
    } catch (err) {
      console.error("Error fetching health package detail:", err)
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const handleLockPackage = async () => {
    if (!healthPackage?._id) return

    try {
      setLockLoading(true)
      setError("")
      setSuccess("")

      const response = await healthPackageService.togglePackageStatus(healthPackage._id)

      if (response.success) {
        // Update local state with new package data
        setHealthPackage(response.data)
        setSuccess(response.message)

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        setError(response.message || "Có lỗi xảy ra khi thay đổi trạng thái")
      }
    } catch (err) {
      console.error("Error locking package:", err)
      setError(err.message || "Có lỗi xảy ra khi thay đổi trạng thái")
    } finally {
      setLockLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
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

  const getTotalServicePrice = (services) => {
    if (!Array.isArray(services)) return 0
    return services.reduce((total, service) => {
      const price = service?.servicePrice || 0
      return total + (isNaN(price) ? 0 : price)
    }, 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "nonactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động"
      case "nonactive":
        return "Không hoạt động"
      default:
        return "Không xác định"
    }
  }

  const getLockButtonStyle = (status) => {
    return status === "active" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
  }

  const getLockButtonText = (status) => {
    return status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
  }

  const getLockButtonIcon = (status) => {
    return status === "active" ? "🔒" : "🔓"
  }

  // Add timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setError("Timeout: Không thể tải dữ liệu sau 10 giây")
        setLoading(false)
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timeout)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin gói khám...</p>
          <p className="text-gray-500 text-sm mt-2">Nếu trang không tải được, vui lòng kiểm tra kết nối mạng</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Tải lại trang
          </button>
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
          <div className="space-x-4">
            <button
              onClick={() => {
                setError("")
                const urlParts = window.location.pathname.split("/")
                const idFromUrl = urlParts[urlParts.length - 1]
                if (idFromUrl && idFromUrl !== "detail") {
                  fetchHealthPackageDetailById(idFromUrl)
                } else if (packageId) {
                  fetchHealthPackageDetail()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Thử lại
            </button>
            <button
              onClick={() => (window.location.href = "/admin/health-packages")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!healthPackage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy gói khám</h2>
          <p className="text-gray-600 mb-4">Gói khám không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => (window.location.href = "/admin/health-packages")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Chi tiết Gói Khám Sức Khỏe</h1>
              <p className="text-blue-100 mt-2">Thông tin chi tiết về gói khám</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <span className="mr-3 text-xl">✅</span>
              <div>
                <h3 className="font-medium">Thành công</h3>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{healthPackage.packageName}</h2>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                          healthPackage.status,
                        )}`}
                      >
                        {getStatusText(healthPackage.status)}
                      </span>
                      <span className="text-sm text-gray-500">ID: {healthPackage._id?.slice(-8) || "N/A"}</span>
                    </div>
                  </div>
                  {healthPackage.packageImage && (
                    <img
                      src={healthPackage.packageImage || "/placeholder.svg"}
                      alt={healthPackage.packageName}
                      className="w-32 h-24 rounded-lg object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/128x96?text=IMG"
                      }}
                    />
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {healthPackage.description || "Chưa có mô tả cho gói khám này."}
                  </p>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Giá gói khám</h4>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(healthPackage.packagePrice)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Tổng giá dịch vụ</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(getTotalServicePrice(healthPackage.service))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Dịch vụ bao gồm</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {healthPackage.service?.length || 0} dịch vụ
                  </span>
                </div>

                {!healthPackage.service || healthPackage.service.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500">Chưa có dịch vụ nào trong gói khám này</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healthPackage.service.map((service, index) => (
                      <div
                        key={service._id || index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {service.serviceName || "Tên dịch vụ"}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {service.description || "Chưa có mô tả cho dịch vụ này."}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-green-600">{formatPrice(service.servicePrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin người tạo</h3>
                {healthPackage.userId ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-semibold text-gray-900">{healthPackage.userId.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{healthPackage.userId.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{healthPackage.userId.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vai trò</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {healthPackage.userId.role || "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Không có thông tin người tạo</p>
                )}
              </div>
            </div>

            {/* Package Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ngày tạo</span>
                    <span className="font-semibold text-gray-900">{formatDate(healthPackage.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cập nhật lần cuối</span>
                    <span className="font-semibold text-gray-900">{formatDate(healthPackage.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Số dịch vụ</span>
                    <span className="font-semibold text-gray-900">{healthPackage.service?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái</span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        healthPackage.status,
                      )}`}
                    >
                      {getStatusText(healthPackage.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => (window.location.href = `/admin/health-packages/update/${healthPackage._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">✏️</span>
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleLockPackage}
                    disabled={lockLoading}
                    className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${getLockButtonStyle(
                      healthPackage.status,
                    )}`}
                  >
                    {lockLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">{getLockButtonIcon(healthPackage.status)}</span>
                        {getLockButtonText(healthPackage.status)}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => (window.location.href = "/admin/health-packages")}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">📋</span>
                    Danh sách gói khám
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHealthPackageDetailPage
