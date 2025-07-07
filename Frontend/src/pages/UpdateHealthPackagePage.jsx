"use client"

import { useState, useEffect } from "react"
import { healthPackageService } from "../services/healthPackageService"
import { listService } from "../services/medicalService"

export default function EditHealthPackageWithServices({ packageId }) {
  const [formData, setFormData] = useState({
    packageName: "",
    packagePrice: "100000",
    packageImage: "",
    description: "",
    service: [],
  })
  const [availableServices, setAvailableServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [packageData, setPackageData] = useState(null) // Store original package data
  const [servicesLoading, setServicesLoading] = useState(true)
  const [packageLoading, setPackageLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const CLOUDINARY_CLOUD_NAME = "dqncabikk"
  const BASE_PACKAGE_PRICE = 100000

  // Load data in sequence: services first, then package
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First load available services
        await fetchAvailableServices()

        // Then load package data
        const id = packageId || window.location.pathname.split("/").pop()
        if (id && id !== "edit") {
          await fetchHealthPackageDetail(id)
        } else {
          setError("Không tìm thấy ID gói khám")
          setPackageLoading(false)
        }
      } catch (err) {
        console.error("Error initializing data:", err)
        setError("Có lỗi xảy ra khi tải dữ liệu")
        setPackageLoading(false)
      }
    }

    initializeData()
  }, [packageId])

  // Update price when selected services change
  useEffect(() => {
    const totalServicePrice = getTotalServicePrice()
    const newPackagePrice = BASE_PACKAGE_PRICE + totalServicePrice
    setFormData((prev) => ({
      ...prev,
      packagePrice: newPackagePrice.toString(),
    }))
  }, [selectedServices])

  const fetchAvailableServices = async () => {
    try {
      setServicesLoading(true)
      console.log("Fetching available services...")

      const response = await listService()
      console.log("Services API response:", response)

      let services = []
      if (response && response.success && Array.isArray(response.data)) {
        services = response.data
      } else if (response && Array.isArray(response.services)) {
        services = response.services
      } else if (Array.isArray(response)) {
        services = response
      } else {
        console.error("Unexpected response format:", response)
        throw new Error("Định dạng dữ liệu dịch vụ không hợp lệ")
      }

      const availableServices = services.filter((service) => service && service.status === "available")
      setAvailableServices(availableServices)
      console.log("Available services loaded:", availableServices.length, availableServices)

      if (availableServices.length === 0) {
        throw new Error("Không có dịch vụ nào khả dụng")
      }

      return availableServices
    } catch (err) {
      console.error("Error fetching services:", err)
      setError(`Có lỗi xảy ra khi tải danh sách dịch vụ: ${err.message}`)
      throw err
    } finally {
      setServicesLoading(false)
    }
  }

  const fetchHealthPackageDetail = async (id) => {
    try {
      setPackageLoading(true)
      setError("")
      console.log("Fetching package detail for ID:", id)

      const response = await healthPackageService.getHealthPackageById(id)
      console.log("Package detail response:", response)

      if (response && response.success) {
        const pkg = response.data
        console.log("Package data:", pkg)
        setPackageData(pkg)

        // Set form data
        setFormData({
          packageName: pkg.packageName || "",
          packagePrice: pkg.packagePrice?.toString() || BASE_PACKAGE_PRICE.toString(),
          packageImage: pkg.packageImage || "",
          description: pkg.description || "",
          service: pkg.service?.map((s) => s._id || s) || [],
        })

        // Wait a bit to ensure availableServices is loaded, then match services
        setTimeout(() => {
          matchPackageServices(pkg.service)
        }, 100)
      } else {
        setError(response?.message || "Không thể tải thông tin gói khám")
      }
    } catch (err) {
      console.error("Error fetching package detail:", err)
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setPackageLoading(false)
    }
  }

  // Add new function to handle service matching
  const matchPackageServices = (packageServices) => {
    if (!packageServices || !Array.isArray(packageServices) || availableServices.length === 0) {
      console.log("No services to match or available services not loaded yet")
      return
    }

    console.log("Matching package services:", packageServices)
    console.log("Available services:", availableServices)

    const matchedServices = []

    packageServices.forEach((pkgService) => {
      // pkgService could be an object with _id or just an ID string
      const serviceId = pkgService._id || pkgService
      console.log("Looking for service ID:", serviceId)

      // Find the full service object from available services
      const fullService = availableServices.find((availService) => availService._id === serviceId)

      if (fullService) {
        console.log("Found matching service:", fullService.paraclinalName, fullService.paraPrice)
        matchedServices.push(fullService)
      } else {
        console.warn("Service not found in available services:", serviceId)
        // If service not found in available services, use the original data if it has price info
        if (pkgService && typeof pkgService === "object" && (pkgService.paraPrice || pkgService.paraclinalName)) {
          console.log("Using original service data:", pkgService)
          matchedServices.push(pkgService)
        }
      }
    })

    console.log("Final matched services:", matchedServices)
    setSelectedServices(matchedServices)
  }

  // Add useEffect to re-match services when availableServices is loaded
  useEffect(() => {
    if (availableServices.length > 0 && packageData && packageData.service) {
      console.log("Available services loaded, re-matching package services")
      matchPackageServices(packageData.service)
    }
  }, [availableServices, packageData])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "packagePrice") {
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleServiceToggle = (serviceId) => {
    console.log("Toggling service:", serviceId)
    const service = availableServices.find((s) => s._id === serviceId)
    console.log("Found service:", service)

    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => (s._id || s) === serviceId)
      console.log("Is selected:", isSelected)

      let newSelected
      if (isSelected) {
        // Remove service
        newSelected = prev.filter((s) => (s._id || s) !== serviceId)
      } else {
        // Add service
        newSelected = [...prev, service]
      }

      console.log("New selected services:", newSelected)
      return newSelected
    })

    // Update form data service array
    setFormData((prev) => {
      const isCurrentlySelected = prev.service.includes(serviceId)
      const newServiceIds = isCurrentlySelected
        ? prev.service.filter((id) => id !== serviceId)
        : [...prev.service, serviceId]

      return {
        ...prev,
        service: newServiceIds,
      }
    })
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File không được vượt quá 5MB")
      return
    }

    setImageUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "ml_default")
      formData.append("folder", "health_packages")

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Upload failed: ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
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
    if (selectedServices.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ")
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

      const updateId = packageId || window.location.pathname.split("/").pop()
      const submitData = {
        ...formData,
        packagePrice: Number.parseFloat(formData.packagePrice),
        packageImage: formData.packageImage || "imageExample.jpg",
        service: selectedServices.map((s) => s._id || s),
      }

      console.log("Submitting data:", submitData)

      const response = await healthPackageService.updateHealthPackage(updateId, submitData)
      if (response.success) {
        setSuccess("Cập nhật gói khám thành công!")
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

  const getTotalServicePrice = () => {
    const total = selectedServices.reduce((total, service) => {
      const price = service?.paraPrice || service?.servicePrice || service?.price || 0
      console.log("Service price calculation:", service?.paraclinalName || service?.name, price)
      return total + (isNaN(price) ? 0 : price)
    }, 0)
    console.log("Total service price:", total)
    return total
  }

  const resetForm = () => {
    if (packageData) {
      // Reset to original package data
      setFormData({
        packageName: packageData.packageName || "",
        packagePrice: packageData.packagePrice?.toString() || BASE_PACKAGE_PRICE.toString(),
        packageImage: packageData.packageImage || "",
        description: packageData.description || "",
        service: packageData.service?.map((s) => s._id || s) || [],
      })

      // Reset selected services
      if (packageData.service && Array.isArray(packageData.service) && availableServices.length > 0) {
        const matchedServices = []
        packageData.service.forEach((pkgService) => {
          const serviceId = pkgService._id || pkgService
          const fullService = availableServices.find((availService) => availService._id === serviceId)
          if (fullService) {
            matchedServices.push(fullService)
          } else if (pkgService && typeof pkgService === "object" && pkgService.paraPrice) {
            matchedServices.push(pkgService)
          }
        })
        setSelectedServices(matchedServices)
      }
    }
    setError("")
    setSuccess("")
  }

  // Helper function to check if a service is selected
  const isServiceSelected = (serviceId) => {
    return selectedServices.some((s) => (s._id || s) === serviceId)
  }

  if (packageLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin gói khám...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Chỉnh Sửa Gói Khám Sức Khỏe</h1>
              <p className="text-blue-100 mt-2">Cập nhật thông tin gói khám sức khỏe và các dịch vụ cận lâm sàng</p>
            </div>
            <button
              onClick={() => (window.location.href = "/admin/health-packages")}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Nhập tên gói khám..."
                      required
                    />
                  </div>

                  {/* Package Price - Read Only */}
                  <div>
                    <label htmlFor="packagePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Giá gói khám <span className="text-blue-500">(Tự động tính)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="packagePrice"
                        name="packagePrice"
                        value={formatPrice(Number.parseFloat(formData.packagePrice))}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">🔒</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Giá cơ bản: {formatPrice(BASE_PACKAGE_PRICE)} + Giá dịch vụ: {formatPrice(getTotalServicePrice())}
                    </p>
                  </div>

                  {/* Package Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh gói khám</label>
                    {formData.packageImage && (
                      <div className="mb-4 flex items-center space-x-4">
                        <img
                          src={formData.packageImage || "/placeholder.svg?height=96&width=128"}
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
                        className="w-full px-4 py-6 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 block transition-colors duration-200"
                      >
                        {imageUploading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600 font-medium">Đang tải ảnh...</span>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">📷</div>
                            <div className="text-blue-600 font-medium mb-1">Chọn hình ảnh gói khám</div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Nhập mô tả chi tiết về gói khám..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Khôi phục
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

          {/* Services Selection Sidebar */}
          <div className="space-y-6">
            {/* Selected Services Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt gói khám</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dịch vụ:</span>
                    <span className="font-semibold">{selectedServices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá cơ bản:</span>
                    <span className="font-semibold text-blue-600">{formatPrice(BASE_PACKAGE_PRICE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá dịch vụ:</span>
                    <span className="font-semibold text-green-600">{formatPrice(getTotalServicePrice())}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Tổng chi phí:</span>
                    <span className="font-bold text-purple-600">
                      {formatPrice(BASE_PACKAGE_PRICE + getTotalServicePrice())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Chọn dịch vụ</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedServices.length} đã chọn
                    </span>
                    <button
                      onClick={() => fetchAvailableServices()}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      disabled={servicesLoading}
                    >
                      🔄 Tải lại
                    </button>
                  </div>
                </div>

                {availableServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Không có dịch vụ</h4>
                    <p className="text-gray-600 text-sm">Chưa có dịch vụ nào khả dụng trong hệ thống</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableServices.map((service) => (
                      <div
                        key={service._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                          isServiceSelected(service._id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleServiceToggle(service._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isServiceSelected(service._id)}
                                onChange={() => handleServiceToggle(service._id)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {service.paraclinalName || service.serviceName || service.name || "Tên dịch vụ"}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 ml-7">
                              {service.specialty?.specialtyName || "Chưa phân loại"} -{" "}
                              {service.room?.roomName || service.room?.roomNumber || "Chưa có phòng"}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-bold text-green-600 text-sm">
                              {formatPrice(service.paraPrice || service.servicePrice || service.price || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
