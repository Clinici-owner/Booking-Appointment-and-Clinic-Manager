import { useState, useEffect } from "react";
import { healthPackageService } from "../services/healthPackageService";
import { listService } from "../services/medicalService";
import { getOpenSpecialties } from "../services/specialtyService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CreateHealthPackageWithServices() {
  const [formData, setFormData] = useState({
    packageName: "",
    packagePrice: "", // Mặc định 100,000 VND
    packageImage: "",
    description: "",
    specialties: [], // Array of selected specialty IDs
    service: [], // Array of selected service IDs
  });
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [openSpecialties, setOpenSpecialties] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  const CLOUDINARY_CLOUD_NAME = "dqncabikk";
  const BASE_PACKAGE_PRICE = 0; // Giá cơ bản của gói khám

  // Fetch available services on component mount
  useEffect(() => {
    fetchAvailableServices();
  }, []);

  // Fetch open specialties for the dropdown
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const specialties = await getOpenSpecialties();
        setOpenSpecialties(specialties);
        console.log("Open specialties fetched:", specialties);
      } catch (err) {
        console.error("Error fetching specialties:", err);
        setError("Không thể tải danh sách chuyên khoa");
      }
    };
    fetchSpecialties();
  }, []);

  // Tự động cập nhật giá gói khám khi chọn dịch vụ
  useEffect(() => {
    const totalServicePrice = getTotalServicePrice();
    const totalSpecialtyPrice = getTotalSpecialtyPrice();
    const newPackagePrice =
      BASE_PACKAGE_PRICE + totalServicePrice + totalSpecialtyPrice;
    setFormData((prev) => ({
      ...prev,
      packagePrice: newPackagePrice.toString(),
    }));
  }, [selectedServices, selectedSpecialties]);

  const fetchAvailableServices = async () => {
    try {
      setServicesLoading(true);
      console.log("Fetching services..."); // Debug log
      const response = await listService();
      console.log("Service response:", response); // Debug log

      // Xử lý response từ ParaclinicalService API
      let services = [];
      if (response && response.success && Array.isArray(response.data)) {
        // Format: { success: true, data: [...] }
        services = response.data;
      } else if (response && Array.isArray(response.services)) {
        // Format từ controller: { message, services: [...] }
        services = response.services;
      } else if (Array.isArray(response)) {
        // Format: [...] (trực tiếp là array)
        services = response;
      } else {
        console.error("Unexpected response format:", response);
        setError("Định dạng dữ liệu dịch vụ không hợp lệ");
        return;
      }

      // Filter chỉ lấy services có status available
      const availableServices = services.filter(
        (service) => service && service.status === "available"
      );

      setAvailableServices(availableServices);
      if (availableServices.length === 0) {
        setError("Không có dịch vụ nào khả dụng");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      console.error("Error details:", err.response?.data); // Debug log
      // Xử lý các loại lỗi khác nhau
      if (err.response?.status === 404) {
        setError(
          "API endpoint không tồn tại. Vui lòng kiểm tra đường dẫn API."
        );
      } else if (err.response?.status === 500) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
      } else {
        setError(`Có lỗi xảy ra khi tải danh sách dịch vụ: ${err.message}`);
      }
    } finally {
      setServicesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Nếu là packagePrice, không cho phép thay đổi thủ công
    if (name === "packagePrice") {
      return; // Không cho phép thay đổi giá gói khám thủ công
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleCKEditorChange = (event, editor) => {
  const data = editor.getData();
  setFormData((prev) => ({
    ...prev,
    description: data,
  }));
  if (error) setError("");
  if (success) setSuccess("");
};

  const handleServiceToggle = (serviceId) => {
    const service = availableServices.find((s) => s._id === serviceId);
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s._id === serviceId);
      if (isSelected) {
        // Remove service
        return prev.filter((s) => s._id !== serviceId);
      } else {
        // Add service
        return [...prev, service];
      }
    });

    setFormData((prev) => ({
      ...prev,
      service: selectedServices.some((s) => s._id === serviceId)
        ? prev.service.filter((id) => id !== serviceId)
        : [...prev.service, serviceId],
    }));
  };

  const handleSpecialtyToggle = (specialtyId) => {
    const specialty = openSpecialties.find((s) => s._id === specialtyId);
    if (!specialty) return;

    setSelectedSpecialties((prev) => {
      const isSelected = prev.some((s) => s._id === specialtyId);
      return isSelected
        ? prev.filter((s) => s._id !== specialtyId)
        : [...prev, specialty];
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File không được vượt quá 5MB");
      return;
    }

    setImageUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      formData.append("folder", "health_packages");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Upload failed: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        packageImage: data.secure_url,
      }));
      setUploadError("");
    } catch (error) {
      console.error("Image upload error:", error);
      setUploadError(`Có lỗi xảy ra khi tải ảnh: ${error.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.packageName.trim()) {
      setError("Tên gói khám là bắt buộc");
      return false;
    }
    if (!formData.packagePrice || formData.packagePrice <= 0) {
      setError("Giá gói khám phải lớn hơn 0");
      return false;
    }
    if (selectedServices.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ");
      return false;
    }
    if (imageUploading) {
      setError("Vui lòng đợi quá trình tải ảnh hoàn tất");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      setError("");
      setSuccess("");

      const submitData = {
        ...formData,
        packagePrice: Number.parseFloat(formData.packagePrice),
        packageImage: formData.packageImage || "imageExample.jpg",
        service: selectedServices.map((s) => s._id),
        specialties: selectedSpecialties.map((s) => s._id),
        userId:
          JSON.parse(
            sessionStorage.getItem("user") || localStorage.getItem("user")
          )?.id ||
          JSON.parse(
            sessionStorage.getItem("user") || localStorage.getItem("user")
          )?._id,
      };

      const response = await healthPackageService.createHealthPackage(
        submitData
      );
      if (response.success) {
        setSuccess("Tạo gói khám thành công!");
        setTimeout(() => {
          window.location.href = "/admin/health-packages";
        }, 1500);
      } else {
        setError(response.message || "Có lỗi xảy ra khi tạo gói khám");
      }
    } catch (err) {
      console.error("Error creating health package:", err);
      setError(err.message || "Có lỗi xảy ra khi tạo gói khám");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTotalServicePrice = () => {
    return selectedServices.reduce((total, service) => {
      const price =
        service.paraPrice || service.servicePrice || service.price || 0;
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };

  const getTotalSpecialtyPrice = () => {
    return selectedSpecialties.reduce((total, specialty) => {
      const price = specialty.medicalFee || 0;
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  };

  const resetForm = () => {
    setFormData({
      packageName: "",
      packagePrice: BASE_PACKAGE_PRICE.toString(),
      packageImage: "",
      description: "",
      specialties: [],
      service: [],
    });
    setSelectedServices([]);
    setSelectedSpecialties([]);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">
            Tạo Gói Khám Sức Khỏe Mới
          </h1>
          <p className="text-blue-100 mt-2">
            Tạo gói khám sức khỏe với các dịch vụ cận lâm sàng
          </p>
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
                    <label
                      htmlFor="packageName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
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
                    <label
                      htmlFor="packagePrice"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Giá gói khám{" "}
                      <span className="text-blue-500">(Tự động tính)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="packagePrice"
                        name="packagePrice"
                        value={formatPrice(
                          Number.parseFloat(formData.packagePrice)
                        )}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">🔒</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Giá cơ bản: {formatPrice(BASE_PACKAGE_PRICE)} + Giá dịch
                      vụ: {formatPrice(getTotalServicePrice())}
                    </p>
                  </div>

                  {/* Package Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh gói khám
                    </label>
                    {formData.packageImage && (
                      <div className="mb-4 flex items-center space-x-4">
                        <img
                          src={
                            formData.packageImage ||
                            "/placeholder.svg?height=96&width=128"
                          }
                          alt="Package Preview"
                          className="w-32 h-24 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              packageImage: "",
                            }))
                          }
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
                            <span className="text-blue-600 font-medium">
                              Đang tải ảnh...
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="text-4xl mb-2">📷</div>
                            <div className="text-blue-600 font-medium mb-1">
                              Chọn hình ảnh gói khám
                            </div>
                            <div className="text-sm text-gray-500">
                              PNG, JPG, JPEG tối đa 5MB
                            </div>
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
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mô tả gói khám
                    </label>
                    {/* <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Nhập mô tả chi tiết về gói khám..."
                    /> */}
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={handleCKEditorChange}
                      config={{
                        placeholder: "Nhập mô tả dịch vụ...",
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Đặt lại
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading || imageUploading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tạo...
                        </>
                      ) : imageUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tải ảnh...
                        </>
                      ) : (
                        "Tạo gói khám"
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Tóm tắt gói khám
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số dịch vụ:</span>
                    <span className="font-semibold">
                      {selectedServices.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá cơ bản:</span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(BASE_PACKAGE_PRICE)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá dịch vụ:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(getTotalServicePrice())}
                    </span>
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
                  <h3 className="text-lg font-bold text-gray-900">
                    Chọn dịch vụ
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedServices.length} đã chọn
                    </span>
                    <button
                      onClick={fetchAvailableServices}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      disabled={servicesLoading}
                    >
                      🔄 Tải lại
                    </button>
                  </div>
                </div>

                {servicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Đang tải dịch vụ...
                    </span>
                  </div>
                ) : error && availableServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Không thể tải dịch vụ
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">{error}</p>
                    <button
                      onClick={fetchAvailableServices}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : availableServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Không có dịch vụ
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Chưa có dịch vụ nào khả dụng trong hệ thống
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {openSpecialties.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Chuyên khoa
                        </h4>
                        <div className="grid gap-3">
                          {openSpecialties.map((specialty) => (
                            <div
                              key={specialty._id}
                              className={`border rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                                selectedSpecialties.some(
                                  (s) => s._id === specialty._id
                                )
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() =>
                                handleSpecialtyToggle(specialty._id)
                              }
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedSpecialties.some(
                                      (s) => s._id === specialty._id
                                    )}
                                    onChange={() =>
                                      handleSpecialtyToggle(specialty._id)
                                    }
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {specialty.specialtyName}
                                  </h4>
                                </div>
                                {/* Có thể thêm mô tả nếu cần */}
                                <div className="text-right ml-2">
                                  <p className="font-bold text-green-600 text-sm">
                                    {formatPrice(specialty.medicalFee)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availableServices.map((service) => (
                      <div
                        key={service._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                          selectedServices.some((s) => s._id === service._id)
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
                                checked={selectedServices.some(
                                  (s) => s._id === service._id
                                )}
                                onChange={() =>
                                  handleServiceToggle(service._id)
                                }
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {service.paraclinalName ||
                                  service.serviceName ||
                                  service.name ||
                                  "Tên dịch vụ"}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 ml-7">
                              {service.specialty?.specialtyName ||
                                "Chưa phân loại"}{" "}
                              -{" "}
                              {service.room?.roomName ||
                                service.room?.roomNumber ||
                                "Chưa có phòng"}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-bold text-green-600 text-sm">
                              {formatPrice(
                                service.paraPrice ||
                                  service.servicePrice ||
                                  service.price ||
                                  0
                              )}
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
  );
}
