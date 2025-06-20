import { useState, useEffect, useRef } from "react"
import { UserService } from "../services/userService"

function UserProfileUpdatePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const hasInitialized = useRef(false)

  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("0")
  const [selectedDistrict, setSelectedDistrict] = useState("0")
  const [selectedWard, setSelectedWard] = useState("0")
  const [detailAddress, setDetailAddress] = useState("")

  const [imageUploading, setImageUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const CLOUDINARY_CLOUD_NAME = "dqncabikk"

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setProvinces(data.data)
      })
  }, [])

  useEffect(() => {
    if (selectedProvince === "0") {
      setDistricts([])
      setWards([])
      setSelectedDistrict("0")
      setSelectedWard("0")
      return
    }

    fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) {
          setDistricts(data.data)
          setWards([])
          setSelectedDistrict("0")
          setSelectedWard("0")
        }
      })
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict === "0") {
      setWards([])
      setSelectedWard("0")
      return
    }

    fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) {
          setWards(data.data)
          setSelectedWard("0")
        }
      })
  }, [selectedDistrict])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const storedUser = sessionStorage.getItem("user")
      if (!storedUser) {
        setError("Không tìm thấy thông tin người dùng")
        return
      }

      const currentUser = JSON.parse(storedUser)
      const result = await UserService.getUserProfileByUserID(currentUser)

      if (result.success) {
        setEditForm({
          fullName: result.data.user.fullName || "",
          phone: result.data.user.phone || "",
          address: result.data.user.address || "",
          dob: result.data.user.dob ? result.data.user.dob.split("T")[0] : "",
          gender: result.data.user.gender,
          avatar: result.data.user.avatar || "",
          cidNumber: result.data.user.cidNumber || "",
        })
        setDetailAddress(result.data.user.address || "")
      } else {
        setError(result.message)
      }
    } catch (err) {
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

  const getFullAddress = () => {
    const provinceName = provinces.find((p) => p.id === selectedProvince)?.full_name || ""
    const districtName = districts.find((d) => d.id === selectedDistrict)?.full_name || ""
    const wardName = wards.find((w) => w.id === selectedWard)?.full_name || ""

    const locationParts = [wardName, districtName, provinceName].filter(Boolean)
    const locationAddress = locationParts.join(", ")

    if (detailAddress && locationAddress) {
      return `${detailAddress}, ${locationAddress}`
    }
    return locationAddress || detailAddress
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file hình ảnh")
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
      formData.append("folder", "user_avatars")

      console.log("🔍 Uploading to Cloudinary...")
      console.log("Cloud name:", CLOUDINARY_CLOUD_NAME)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      })

      console.log("🔍 Cloudinary response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Cloudinary error:", errorData)
        throw new Error(`Upload failed: ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      console.log("Cloudinary success:", data)
      console.log("Secure URL:", data.secure_url)

      setEditForm((prev) => {
        const newForm = { ...prev, avatar: data.secure_url }
        console.log("🔍 Updated editForm with avatar:", newForm)
        return newForm
      })

      setUploadError("")
    } catch (error) {
      console.error("❌ Upload error:", error)
      setUploadError(`Có lỗi xảy ra khi tải ảnh: ${error.message}`)
    } finally {
      setImageUploading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)

    try {
      const storedUser = sessionStorage.getItem("user")
      const currentUser = JSON.parse(storedUser)

      console.log("🔍 editForm before update:", editForm)
      console.log("🔍 editForm.avatar:", editForm.avatar)

      const updatedForm = {
        ...editForm,
        address: getFullAddress(),
      }

      console.log("=== FRONTEND DEBUG ===")
      console.log("User ID:", currentUser._id)
      console.log("Avatar in updatedForm:", updatedForm.avatar)

      if (!updatedForm.avatar || updatedForm.avatar === "") {
        console.log("Avatar is empty or undefined!")
      } else {
        console.log("Avatar has value:", updatedForm.avatar)
      }

      const result = await UserService.updateUserProfile(currentUser._id, updatedForm)

      console.log("API Response:", result)

      if (result.success) {
        setSuccessMessage("Cập nhật thành công!")
        setTimeout(() => (window.location.href = "/user-profile"), 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Update error:", err)
      setError(err.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      fetchUserProfile()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin cá nhân</h1>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số CMND/CCCD</label>
                <input
                  type="text"
                  name="cidNumber"
                  value={editForm.cidNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                <input
                  type="date"
                  name="dob"
                  value={editForm.dob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Tỉnh Thành</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedProvince === "0"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Quận Huyện</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={selectedDistrict === "0"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Phường Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="Địa chỉ chi tiết"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                />

                {getFullAddress() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Địa chỉ:</strong> {getFullAddress()}
                    </p>
                  </div>
                )}
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
                      className="mr-2"
                    />
                    Nam
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="false"
                      checked={editForm.gender === false}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Nữ
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>

                {editForm.avatar && editForm.avatar !== "/img/dafaultAvatar.jpg" && (
                  <div className="mb-4 flex items-center space-x-4">
                    <img
                      src={editForm.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, avatar: "" }))}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
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
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 block"
                  >
                    {imageUploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-blue-600">Đang tải...</span>
                      </div>
                    ) : (
                      <div>
                        <div className="text-blue-600 font-medium">Chọn ảnh</div>
                        <div className="text-xs text-gray-500">PNG, JPG tối đa 5MB</div>
                      </div>
                    )}
                  </label>
                </div>

                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={updateLoading || imageUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg"
              >
                {updateLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/user-profile")}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfileUpdatePage
