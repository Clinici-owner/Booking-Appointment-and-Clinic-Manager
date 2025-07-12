import React from "react"
import { Link } from "react-router-dom"

function HealthPackageList({
  healthPackages,
  onDelete,
  onToggleStatus,
  showDeleteButton = false,
  showToggleButton = false,
  showDetailButton = true, // Mặc định hiển thị, có thể tắt khi cần
}) {
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {healthPackages.map((pkg) => (
        <div
          key={pkg._id}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative">
            <img
              src={pkg.packageImage || "/placeholder.svg?height=200&width=300"}
              alt={pkg.packageName}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x200?text=Gói+Khám"
              }}
            />
            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pkg.status === "active"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {pkg.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{pkg.packageName}</h3>
              <p className="text-gray-600 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: pkg.description }}></p>
            </div>

            {/* Price Section - Simplified */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Giá gói khám:</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(pkg.packagePrice)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                <span className="text-sm text-gray-600">Số dịch vụ:</span>
                <span className="text-sm font-semibold text-gray-700">{pkg.service?.length || 0} dịch vụ</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {showDetailButton && (
                <button
                  onClick={() => (window.location.href = `/admin/health-packages/detail/${pkg._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  📋 Chi tiết
                </button>
              )}

              {showToggleButton && (
                <button
                  onClick={() => onToggleStatus(pkg._id)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                    pkg.status === "active"
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {pkg.status === "active" ? "🔒" : "🔓"}
                </button>
              )}

              {showDeleteButton && (
                <button
                  onClick={() => onDelete(pkg._id)}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                >
                  🗑️
                </button>
              )}

              {/* Nếu không có button nào hiển thị, có thể thêm một button khác cho user */}
              {!showDetailButton && !showToggleButton && !showDeleteButton && (
                <Link
                  to={`/health-packages/detail/${pkg._id}`}
                  className="w-full text-center text-white bg-custom-blue py-2 px-4 rounded-lg text-sm font-medium hover:bg-custom-bluehover2 transition-colors duration-300"
                >
                  Chi tiết gói khám
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HealthPackageList
