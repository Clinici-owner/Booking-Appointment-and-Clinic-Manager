import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"

function UpdateHealthPackagePage({ packageId }) {
  const [formData, setFormData] = useState({
    packageName: "",
    packagePrice: "",
    packageImage: "",
    description: "",
  })

  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const CLOUDINARY_CLOUD_NAME = "dqncabikk"

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

      if (idFromUrl && idFromUrl !== "update" && idFromUrl !== "edit") {
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
        const pkg = response.data
        setFormData({
          packageName: pkg.packageName || "",
          packagePrice: pkg.packagePrice || "",
          packageImage: pkg.packageImage || "",
          description: pkg.description || "",
        })
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
        const pkg = response.data
        setFormData({
          packageName: pkg.packageName || "",
          packagePrice: pkg.packagePrice || "",
          packageImage: pkg.packageImage || "",
          description: pkg.description || "",
        })
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear messages when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File không được vượt quá 5MB")
      return
    }

    setImageUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "ml_default") // Thay bằng upload preset của bạn
      formData.append("folder", "health_packages") // Folder để organize ảnh

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Upload failed: ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()

      // Update form data with uploaded image URL
      setFormData((prev) => ({
        ...prev,
        packageImage: data.secure_url,
      }))

      setUploadError("")
    } catch (error) {
      console.error("Image upload error:", error)
      setUploadError(`Có lỗi xảy ra khi tải ảnh: ${error.message}`)
    } finally {
      setImageUploading(false)
    }
  }

  const validateForm = () => {
    if (!formData.packageName.trim()) {
      setError("Tên gói khám là bắt buộc")
      return false
    }
    if (!formData.packagePrice || formData.packagePrice <= 0) {
      setError("Giá gói khám phải lớn hơn 0")
      return false
    }
    if (imageUploading) {
      setError("Vui lòng đợi quá trình tải ảnh hoàn tất")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitLoading(true)
      setError("")
      setSuccess("")

      const submitData = {
        ...formData,
        packagePrice: Number.parseFloat(formData.packagePrice),
        packageImage: formData.packageImage || "imageExample.jpg",
      }

      // Get ID from props or URL
      const updateId = packageId || window.location.pathname.split("/").pop()
      console.log("Updating package with ID:", updateId)

      const response = await healthPackageService.updateHealthPackage(updateId, submitData)

      if (response.success) {
        setSuccess("Cập nhật gói khám thành công!")
        // Navigate back to health packages list after 1.5 seconds
        setTimeout(() => {
          window.location.href = "/admin/health-packages"
        }, 1500)
      } else {
        setError(response.message || "Có lỗi xảy ra khi cập nhật gói khám")
      }
    } catch (err) {
      console.error("Error updating health package:", err)
      setError(err.message || "Có lỗi xảy ra khi cập nhật gói khám")
    } finally {
      setSubmitLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  if (error && !formData.packageName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              onClick={() => {
                setError("")
                const urlParts = window.location.pathname.split("/")
                const idFromUrl = urlParts[urlParts.length - 1]
                if (idFromUrl && idFromUrl !== "update" && idFromUrl !== "edit") {
                  fetchHealthPackageDetailById(idFromUrl)
                } else if (packageId) {
                  fetchHealthPackageDetail()
                }
              }}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Cập Nhật Gói Khám Sức Khỏe</h1>
              <p className="text-blue-100 mt-2">Chỉnh sửa thông tin gói khám</p>
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

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-800">
                  <span className="mr-3 text-xl">⚠️</span>
                  <div>
                    <h3 className="font-medium">Có lỗi xảy ra</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package Name */}
              <div>
                <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên gói khám <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="packageName"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="Nhập tên gói khám..."
                  required
                />
              </div>

              {/* Package Price */}
              <div>
                <label htmlFor="packagePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá gói khám <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="packagePrice"
                  name="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="Nhập giá gói khám..."
                  min="0"
                  step="1000"
                  required
                />
                {formData.packagePrice && (
                  <p className="text-sm text-gray-600 mt-1">
                    Giá: {formatPrice(Number.parseFloat(formData.packagePrice))}
                  </p>
                )}
              </div>

              {/* Package Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh gói khám</label>

                {formData.packageImage && (
                  <div className="mb-4 flex items-center space-x-4">
                    <img
                      src={formData.packageImage || "/placeholder.svg"}
                      alt="Package Preview"
                      className="w-32 h-24 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, packageImage: "" }))}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="hidden"
                    id="package-image-upload"
                  />
                  <label
                    htmlFor="package-image-upload"
                    className="w-full px-4 py-6 border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-400 hover:bg-green-50 block transition-colors duration-200"
                  >
                    {imageUploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="text-green-600 font-medium">Đang tải ảnh...</span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📷</div>
                        <div className="text-green-600 font-medium mb-1">Chọn hình ảnh mới</div>
                        <div className="text-sm text-gray-500">PNG, JPG, JPEG tối đa 5MB</div>
                      </div>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">Để trống nếu không muốn thay đổi hình ảnh hiện tại</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả gói khám
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="Nhập mô tả chi tiết về gói khám..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => (window.location.href = "/admin/health-packages")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || imageUploading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : imageUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tải ảnh...
                    </>
                  ) : (
                    "Cập nhật gói khám"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateHealthPackagePage
