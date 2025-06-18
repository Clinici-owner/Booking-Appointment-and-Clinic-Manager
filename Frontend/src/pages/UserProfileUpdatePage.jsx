import { useState, useEffect, useRef } from "react"
import { UserService } from "../services/userService"

function UserProfileUpdatePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [redirectCountdown, setRedirectCountdown] = useState(0)
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
        // Initialize edit form with current user data
        setEditForm({
          fullName: result.data.user.fullName || "",
          phone: result.data.user.phone || "",
          address: result.data.user.address || "",
          dob: result.data.user.dob ? result.data.user.dob.split("T")[0] : "",
          gender: result.data.user.gender,
          avatar: result.data.user.avatar || "",
        })
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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "radio" ? (value === "true" ? true : value === "false" ? false : value) : value,
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setError(null)
    setSuccessMessage("")

    try {
      const storedUser = sessionStorage.getItem("user")
      const currentUser = JSON.parse(storedUser)

      const result = await UserService.updateUserProfile(currentUser._id, editForm)

      if (result.success) {
        setUser(result.data.user)
        setSuccessMessage("Cập nhật thông tin thành công! Đang chuyển về trang profile...")
        // Update session storage with new data
        const updatedSessionUser = { ...currentUser, ...result.data.user }
        sessionStorage.setItem("user", JSON.stringify(updatedSessionUser))

        // Start countdown and redirect
        setRedirectCountdown(3)
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              window.location.href = "/user-profile"
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message || "Không thể cập nhật thông tin")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleCancel = () => {
    window.location.href = "/user-profile"
  }

  const handleBackToProfile = () => {
    window.location.href = "/user-profile"
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      console.log("useEffect triggered - First time only")
      hasInitialized.current = true
      fetchUserProfile()
    }
  }, [])

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

  if (error && !user) {
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchUserProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Thử lại
            </button>
            <button
              onClick={handleBackToProfile}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Về trang Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin cá nhân</h1>
                <p className="text-gray-600">Cập nhật thông tin của bạn</p>
              </div>
            </div>
            {user && (
              <img
                src={user.avatar || "/img/defaultAvatar.jpg"}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
              />
            )}
          </div>
        </div>

        {/* Success Message with Countdown */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800">{successMessage}</p>
              </div>
              {redirectCountdown > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {redirectCountdown}s
                  </div>
                  <button
                    onClick={handleBackToProfile}
                    className="text-green-600 hover:text-green-800 text-sm font-medium underline"
                  >
                    Chuyển ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={updateLoading || redirectCountdown > 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  disabled={updateLoading || redirectCountdown > 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={updateLoading || redirectCountdown > 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={editForm.dob}
                  onChange={handleInputChange}
                  disabled={updateLoading || redirectCountdown > 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="true"
                      checked={editForm.gender === true}
                      onChange={handleInputChange}
                      disabled={updateLoading || redirectCountdown > 0}
                      className="mr-2 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className={`text-gray-700 ${updateLoading || redirectCountdown > 0 ? "text-gray-400" : ""}`}>
                      Nam
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="false"
                      checked={editForm.gender === false}
                      onChange={handleInputChange}
                      disabled={updateLoading || redirectCountdown > 0}
                      className="mr-2 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className={`text-gray-700 ${updateLoading || redirectCountdown > 0 ? "text-gray-400" : ""}`}>
                      Nữ
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value=""
                      checked={editForm.gender === "" || editForm.gender === null}
                      onChange={handleInputChange}
                      disabled={updateLoading || redirectCountdown > 0}
                      className="mr-2 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className={`text-gray-700 ${updateLoading || redirectCountdown > 0 ? "text-gray-400" : ""}`}>
                      Không xác định
                    </span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                <input
                  type="url"
                  name="avatar"
                  value={editForm.avatar}
                  onChange={handleInputChange}
                  disabled={updateLoading || redirectCountdown > 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Nhập URL avatar"
                />
                {editForm.avatar && (
                  <div className="mt-3 flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Preview:</span>
                    <img
                      src={editForm.avatar || "/placeholder.svg"}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={updateLoading || redirectCountdown > 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang cập nhật...</span>
                  </>
                ) : redirectCountdown > 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Đã lưu thành công</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={updateLoading || redirectCountdown > 0}
                className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{redirectCountdown > 0 ? "Đang chuyển..." : "Hủy"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfileUpdatePage
