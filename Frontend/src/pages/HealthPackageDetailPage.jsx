import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"

function AdminHealthPackageDetailPage({ packageId }) {
  const [healthPackage, setHealthPackage] = useState(null)
  const [paraclinicalServiceNames, setParaclinicalServiceNames] = useState([])
  const [serviceStats, setServiceStats] = useState({
    totalServices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [error, setError] = useState("")
  const [lockLoading, setLockLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    console.log("PackageId received:", packageId)
    if (packageId) {
      fetchHealthPackageDetail()
      fetchParaclinicalServiceNames()
    } else {
      const urlParts = window.location.pathname.split("/")
      const idFromUrl = urlParts[urlParts.length - 1]
      console.log("ID from URL:", idFromUrl)
      if (idFromUrl && idFromUrl !== "detail") {
        fetchHealthPackageDetailById(idFromUrl)
        fetchParaclinicalServiceNamesById(idFromUrl)
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
      const response = await healthPackageService.getHealthPackageById(packageId)
      if (response && response.success) {
        setHealthPackage(response.data)
      } else {
        setError(response?.message || "Không thể tải thông tin gói khám")
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthPackageDetailById = async (id) => {
    try {
      setLoading(true)
      setError("")
      const response = await healthPackageService.getHealthPackageById(id)
      if (response && response.success) {
        setHealthPackage(response.data)
      } else {
        setError(response?.message || "Không thể tải thông tin gói khám")
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const fetchParaclinicalServiceNames = async () => {
    try {
      setServicesLoading(true)
      const response = await healthPackageService.getParaclinicalNamesOnly(packageId)

      if (response && response.success) {
        const serviceNames = Array.isArray(response.data) ? response.data : []
        setParaclinicalServiceNames(serviceNames)
        setServiceStats({
          totalServices: serviceNames.length,
        })
      } else {
        setParaclinicalServiceNames([])
        setServiceStats({ totalServices: 0 })
      }
    } catch (err) {
      setParaclinicalServiceNames([])
      setServiceStats({ totalServices: 0 })
      setError(err.message || "Có lỗi xảy ra khi tải danh sách dịch vụ cận lâm sàng")
    } finally {
      setServicesLoading(false)
    }
  }

  const fetchParaclinicalServiceNamesById = async (id) => {
    try {
      setServicesLoading(true)
      const response = await healthPackageService.getParaclinicalNamesOnly(id)

      if (response && response.success) {
        const serviceNames = Array.isArray(response.data) ? response.data : []
        setParaclinicalServiceNames(serviceNames)
        setServiceStats({
          totalServices: serviceNames.length,
        })
      } else {
        setParaclinicalServiceNames([])
        setServiceStats({ totalServices: 0 })
      }
    } catch (err) {
      setParaclinicalServiceNames([])
      setServiceStats({ totalServices: 0 })
      setError(err.message || "Có lỗi xảy ra khi tải danh sách dịch vụ cận lâm sàng")
    } finally {
      setServicesLoading(false)
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
        setHealthPackage(response.data)
        setSuccess(response.message)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.message || "Có lỗi xảy ra khi thay đổi trạng thái")
      }
    } catch (err) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin gói khám...</p>
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
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Thử lại
          </button>
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
          <button
            onClick={() => (window.location.href = "/admin/health-packages")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Chi tiết Gói Khám Sức Khỏe</h1>
              <p className="text-blue-100 mt-2">Thông tin chi tiết về gói khám</p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin/health-packages")}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <span className="mr-3 text-xl">✅</span>
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{healthPackage.packageName}</h2>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(healthPackage.status)}`}
                    >
                      {getStatusText(healthPackage.status)}
                    </span>
                    <span className="text-sm text-gray-500">ID: {healthPackage._id?.slice(-8) || "N/A"}</span>
                  </div>
                </div>
                {healthPackage.packageImage && (
                  <img
                    src={healthPackage.packageImage || "/placeholder.svg?height=96&width=128"}
                    alt={healthPackage.packageName}
                    className="w-32 h-24 rounded-lg object-cover border-2 border-gray-200"
                  />
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: healthPackage.description }}></p>
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Giá gói khám</h4>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(healthPackage.packagePrice)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Số dịch vụ</h4>
                  <p className="text-2xl font-bold text-blue-600">{serviceStats.totalServices}</p>
                </div>
              </div>
            </div>

            {/* Service Names */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Danh sách dịch vụ cận lâm sàng</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {serviceStats.totalServices} dịch vụ
                </span>
              </div>

              {servicesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải danh sách dịch vụ...</p>
                </div>
              ) : paraclinicalServiceNames.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">Chưa có dịch vụ cận lâm sàng nào trong gói khám này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paraclinicalServiceNames.map((serviceName, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {serviceName || "Tên dịch vụ không xác định"}
                          </h4>
                        </div>
                        <span className="text-green-600 text-sm">✓ Có sẵn</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
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
                </div>
              ) : (
                <p className="text-gray-500">Không có thông tin người tạo</p>
              )}
            </div>

            {/* Package Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-semibold text-gray-900">{formatDate(healthPackage.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số dịch vụ</span>
                  <span className="font-semibold text-gray-900">{serviceStats.totalServices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(healthPackage.status)}`}
                  >
                    {getStatusText(healthPackage.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác</h3>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = `/admin/health-packages/edit/${healthPackage._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  onClick={handleLockPackage}
                  disabled={lockLoading}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 ${
                    healthPackage.status === "active"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {lockLoading ? (
                    "Đang xử lý..."
                  ) : (
                    <>{healthPackage.status === "active" ? "🔒 Vô hiệu hóa" : "🔓 Kích hoạt"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHealthPackageDetailPage
