import { useState, useEffect, useRef } from "react"
import { UserService } from "../services/userService"

export default function ChangePasswordPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const hasInitialized = useRef(false)

  const fetchUserSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const storedUser = sessionStorage.getItem("user")
      let currentUser = null

      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser)
        } catch (parseError) {
          setError("Dữ liệu session không hợp lệ", parseError.message)
          setLoading(false)
          return
        }
      }

      if (!currentUser || !currentUser._id) {
        setError("Không tìm thấy thông tin người dùng trong session hoặc thiếu id")
        setLoading(false)
        return
      }

      // Set user data from session
      setUser(currentUser)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      fetchUserSession()
    }
  }, [])

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [message, setMessage] = useState({ type: "", content: "" })
  const [validationErrors, setValidationErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Real-time validation
    const newValidationErrors = { ...validationErrors }

    if (name === "confirmPassword") {
      if (value && formData.newPassword && value !== formData.newPassword) {
        newValidationErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      } else {
        newValidationErrors.confirmPassword = ""
      }
    }

    if (name === "newPassword") {
      if (formData.confirmPassword && value && formData.confirmPassword !== value) {
        newValidationErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      } else {
        newValidationErrors.confirmPassword = ""
      }

      if (value && value.length < 6) {
        newValidationErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
      } else {
        newValidationErrors.newPassword = ""
      }
    }

    if (name === "oldPassword") {
      if (value && formData.newPassword && value === formData.newPassword) {
        newValidationErrors.oldPassword = "Mật khẩu mới phải khác mật khẩu cũ"
      } else {
        newValidationErrors.oldPassword = ""
      }
    }

    setValidationErrors(newValidationErrors)

    // Xóa thông báo khi người dùng bắt đầu nhập
    if (message.content) {
      setMessage({ type: "", content: "" })
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validateForm = () => {
    if (!formData.oldPassword) {
      setMessage({ type: "error", content: "Vui lòng nhập mật khẩu cũ" })
      return false
    }
    if (!formData.newPassword) {
      setMessage({ type: "error", content: "Vui lòng nhập mật khẩu mới" })
      return false
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", content: "Mật khẩu mới phải có ít nhất 6 ký tự" })
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", content: "Mật khẩu xác nhận không khớp" })
      return false
    }
    if (formData.oldPassword === formData.newPassword) {
      setMessage({ type: "error", content: "Mật khẩu mới phải khác mật khẩu cũ" })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user || !user._id) {
      setMessage({ type: "error", content: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại." })
      return
    }

    if (!validateForm()) return

    setLoading(true)
    try {
      // Sử dụng user._id từ session
      const response = await UserService.ChangeAccountPasswords(user._id, formData.oldPassword, formData.newPassword)

      setMessage({
        type: "success",
        content: response.message || "Đổi mật khẩu thành công!",
      })

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Redirect to user profile page after 2 seconds
      setTimeout(() => {
        window.location.href = "/user-profile"
      }, 2000)
    } catch (error) {
      setMessage({
        type: "error",
        content: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
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
            onClick={fetchUserSession}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mr-2"
          >
            Thử lại
          </button>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="text-center p-6 pb-4">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thay đổi mật khẩu</h1>
          <p className="text-sm text-gray-600">
            Xin chào <span className="font-medium text-blue-600">{user?.fullName || user?.email}</span>
            <br />
            Nhập mật khẩu cũ và mật khẩu mới để thay đổi
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4" id="password-form">
            {/* Mật khẩu cũ */}
            <div className="space-y-2">
              <label htmlFor="oldPassword" className="text-sm font-medium text-gray-700">
                Mật khẩu cũ
              </label>
              <div className="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPasswords.old ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu cũ"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("old")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.old ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.oldPassword && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.oldPassword}</p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.newPassword}</p>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Thông báo */}
            {message.content && (
              <div
                className={`p-4 rounded-md border ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-green-200 bg-green-50 text-green-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </form>

          {/* Action Buttons - matching user profile page style */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => (window.location.href = "/user-profile")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Quay trở lại</span>
            </button>
            <button
              type="submit"
              form="password-form"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>{loading ? "Đang xử lý..." : "Thay đổi mật khẩu"}</span>
            </button>
          </div>

          {/* Yêu cầu mật khẩu */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Ít nhất 6 ký tự</li>
              <li>• Khác với mật khẩu cũ</li>
              <li>• Nên bao gồm chữ hoa, chữ thường và số</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
