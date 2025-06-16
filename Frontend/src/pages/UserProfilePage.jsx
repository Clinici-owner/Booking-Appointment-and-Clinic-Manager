"use client"

import { useState, useEffect, useRef } from "react"
import { UserService } from "../services/userService"

function UserProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const hasInitialized = useRef(false)

  const fetchUserProfile = async () => {
    console.log("fetchUserProfile called")

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

      if (!currentUser || !currentUser._id) {
        console.log("currentUser:", currentUser)
        setError("Không tìm thấy thông tin người dùng trong session hoặc thiếu id")
        setLoading(false)
        return
      }

      const result = await UserService.getUserProfileByUserID(currentUser)

      if (result.success) {
        setUser(result.data.user)
      } else {
        setError(result.message || "Không thể lấy thông tin người dùng")
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    // Navigate to edit profile page
    window.location.href = "/update-profile"
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("useEffect triggered - First time only")
      hasInitialized.current = true
      fetchUserProfile()
    }
  }, [])

  console.log("Component re-rendered", { user: !!user, loading, error: !!error })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
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
          <button
            onClick={fetchUserProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={user.avatar || "/img/defaultAvatar.jpg"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">{user.fullName || "Người dùng mới"}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "doctor"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role || "patient"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.status || "non-active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Email:</label>
                <span className="text-gray-900 break-all">{user.email}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Số điện thoại:</label>
                <span className="text-gray-900">{user.phone || "Chưa cập nhật"}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Số CCCD:</label>
                <span className="text-gray-900">{user.cidNumber || "Chưa cập nhật"}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Địa chỉ:</label>
                <span className="text-gray-900">{user.address || "Chưa cập nhật"}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Ngày sinh:</label>
                <span className="text-gray-900">
                  {user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Giới tính:</label>
                <span className="text-gray-900">
                  {user.gender === true ? "Nam" : user.gender === false ? "Nữ" : "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin tài khoản</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Vai trò:</label>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "doctor"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role || "patient"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Trạng thái:</label>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.status || "non-active"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">Ngày tạo:</label>
                <span className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-gray-500 w-full sm:w-32 mb-1 sm:mb-0">
                  Cập nhật lần cuối:
                </label>
                <span className="text-gray-900">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleEditProfile}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Cập Nhật Thông Tinh Cá Nhân</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage
