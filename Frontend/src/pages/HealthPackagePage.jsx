import { useState, useEffect, useRef } from "react"
import {healthPackageService} from "../services/healthPackageService"

function HealthPackagePage() {
  const [user, setUser] = useState(null)
  const [healthPackages, setHealthPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchFilters, setSearchFilters] = useState({
    packageName: "",
    minPrice: "",
    maxPrice: "",
    userId: "",
  })
  const hasInitialized = useRef(false)

  const fetchHealthPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      const storedUser = sessionStorage.getItem("user")
      let currentUser = null

      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
        } catch (parseError) {
          console.error("Dữ liệu session không hợp lệ:", storedUser, parseError)
          setError("Dữ liệu session không hợp lệ")
          setLoading(false)
          return
        }
      }

      // Set user data from session (optional)
      setUser(currentUser)

      // Fetch all health packages - sử dụng getAllHealthPackages thay vì getHealthPackagesByUserId
      const result = await healthPackageService.getAllHealthPackages()
      if (result.success) {
        setHealthPackages(result.data)
      } else {
        setError(result.message || "Không thể lấy danh sách gói khám")
      }
    } catch (err) {
      console.error("Error in fetchHealthPackages:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Tìm kiếm gói khám
  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {}
      if (searchFilters.packageName) filters.packageName = searchFilters.packageName
      if (searchFilters.minPrice) filters.minPrice = searchFilters.minPrice
      if (searchFilters.maxPrice) filters.maxPrice = searchFilters.maxPrice
      if (searchFilters.userId) filters.userId = searchFilters.userId

      const result = await healthPackageService.searchHealthPackages(filters)
      if (result.success) {
        setHealthPackages(result.data)
      } else {
        setError(result.message || "Không thể tìm kiếm gói khám")
      }
    } catch (err) {
      console.error("Error in handleSearch:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset search
  const handleResetSearch = () => {
    setSearchFilters({
      packageName: "",
      minPrice: "",
      maxPrice: "",
      userId: "",
    })
    fetchHealthPackages()
  }

  // Xóa health package (chỉ admin hoặc owner)
  const handleDelete = async (packageId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa gói khám này?")) return

    try {
      const result = await healthPackageService.deleteHealthPackage(packageId)
      if (result.success) {
        alert("Xóa gói khám thành công!")
        fetchHealthPackages() // Refresh danh sách
      } else {
        alert("Lỗi: " + result.message)
      }
    } catch (error) {
      alert("Lỗi: " + error.message)
    }
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("useEffect triggered - First time only")
      hasInitialized.current = true
      fetchHealthPackages()
    }
  }, [])

  console.log("Component re-rendered", { user: !!user, loading, error: !!error })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách gói khám...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Kiểm tra:</p>
            <ul className="text-xs text-gray-400 text-left">
              <li>• Server có đang chạy tại localhost:3000?</li>
              <li>• API endpoint /api/heartPackage có tồn tại?</li>
              <li>• Database có kết nối được không?</li>
            </ul>
          </div>
          <button
            onClick={fetchHealthPackages}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Danh sách gói khám sức khỏe</h1>
              <p className="text-gray-600 mt-1">
                {user ? (
                  <>
                    Xin chào <span className="font-medium text-blue-600">{user?.fullName || user?.email}</span> - Khám
                    phá các gói khám sức khỏe
                  </>
                ) : (
                  "Khám phá các gói khám sức khỏe dành cho bạn"
                )}
              </p>
            </div>
            <button
              onClick={fetchHealthPackages}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Làm mới
            </button>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Tên gói khám..."
              value={searchFilters.packageName}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, packageName: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Giá từ..."
              value={searchFilters.minPrice}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Giá đến..."
              value={searchFilters.maxPrice}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="ID người tạo..."
              value={searchFilters.userId}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, userId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Tìm kiếm
            </button>
            <button
              onClick={handleResetSearch}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Content */}
        {healthPackages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy gói khám nào</h3>
            <p className="text-gray-600">
              Hiện tại chưa có gói khám sức khỏe nào hoặc không khớp với tiêu chí tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthPackages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <img
                  src={pkg.packageImage || "/placeholder.svg?height=200&width=300"}
                  alt={pkg.packageName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.packageName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pkg.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pkg.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {pkg.packagePrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>Số dịch vụ: {pkg.service?.length || 0}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Tạo bởi: {pkg.userId?.fullName || "Không rõ"}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10"
                        />
                      </svg>
                      <span>Tạo: {new Date(pkg.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                      Xem chi tiết
                    </button>
                    {/* Chỉ hiển thị nút xóa cho admin hoặc owner */}
                    {user && (user.role === "admin" || user._id === pkg.userId?._id) && (
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {healthPackages.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{healthPackages.length}</div>
                <div className="text-gray-600">Tổng số gói khám</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {healthPackages.filter((pkg) => pkg.status === "active").length}
                </div>
                <div className="text-gray-600">Gói đang hoạt động</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {healthPackages.reduce((total, pkg) => total + (pkg.service?.length || 0), 0)}
                </div>
                <div className="text-gray-600">Tổng số dịch vụ</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HealthPackagePage
