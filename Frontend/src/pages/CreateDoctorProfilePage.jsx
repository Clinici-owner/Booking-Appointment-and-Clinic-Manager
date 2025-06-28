import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { uploadToCloudinary } from "../services/documentUploadService";
import { uploadDocument } from "../services/documentUploadService";
import { getAllSpecialties } from "../services/specialtyService";
import { DoctorService } from "../services/doctorService";

function CreateDoctorProfilePage() {
  // State management
  const [images, setImages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();


  const [doctorProfile, setDoctorProfile] = useState({
    doctorId: "",
    description: "",
    yearsOfExperience: "",
    specialties: [],
    certificateId: [],
  });

  // Fetch specialties on component mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await getAllSpecialties();
        setSpecialties(data);
        const user = sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          setDoctorProfile(prev => ({
            ...prev,
            doctorId: userData._id,
          }));
        }
      } catch (error) {
        console.error("Error fetching specialties:", error);
        setError("Không thể tải danh sách chuyên khoa");
      }
    };

    fetchSpecialties();

    // Clean up image preview URLs when component unmounts
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, []);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (doctorProfile.specialties.length === 0) {
      errors.specialties = "Vui lòng chọn ít nhất một chuyên khoa";
    }

    if (!doctorProfile.yearsOfExperience) {
      errors.yearsOfExperience = "Vui lòng nhập số năm kinh nghiệm";
    } else if (isNaN(doctorProfile.yearsOfExperience) || Number(doctorProfile.yearsOfExperience) < 0) {
      errors.yearsOfExperience = "Số năm kinh nghiệm không hợp lệ";
    }

    if (!doctorProfile.description || doctorProfile.description.trim().length < 50) {
      errors.description = "Mô tả phải có ít nhất 50 ký tự";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let certificateId = [];

      // Upload images if any
      if (images.length > 0) {
        try {
          const uploadedUrls = await Promise.all(
            images.map(image => uploadToCloudinary(image.file))
          );

          const insertedDocuments = await Promise.all(
            uploadedUrls.map(url => uploadDocument(url))
          );

          certificateId = insertedDocuments.map(doc => doc.document._id);
        } catch (uploadError) {
          console.error("Error uploading documents:", uploadError);
          throw new Error("Có lỗi khi tải lên chứng chỉ. Vui lòng thử lại.");
        }
      }

      // Prepare payload
      const payload = {
        doctorId: doctorProfile.doctorId,
        description: doctorProfile.description,
        yearsOfExperience: Number(doctorProfile.yearsOfExperience),
        specialties: doctorProfile.specialties,
        certificateId,
      };

      // Submit to API
      const result = await DoctorService.createDoctorProfile(payload);
      console.log("Doctor profile created successfully:", result);

      // Reset form on success
      setDoctorProfile(prev => ({
        ...prev,
        description: "",
        yearsOfExperience: "",
        specialties: [],
      }));
      setImages([]);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Failed to create doctor profile:", error);
      setError(error.message || "Có lỗi xảy ra khi tạo hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle specialty selection
  const handleSpecialtyChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    setDoctorProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(selectedId)
        ? prev.specialties.filter(id => id !== selectedId)
        : [...prev.specialties, selectedId]
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...files]);
  };

  // Remove an uploaded image
  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl text-custom-blue font-bold mb-6 text-center">
        Tạo Hồ Sơ Bác Sĩ
      </h1>

      {/* Status messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Tạo hồ sơ thành công! Bạn có thể xem hồ sơ trong phần quản lý cá nhân.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Specialties Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chuyên Khoa *
          </label>
          <select
            multiple
            className="border border-gray-300 rounded-lg p-2 w-full h-auto min-h-[42px] focus:ring-custom-blue focus:border-custom-blue"
            value={doctorProfile.specialties}
            onChange={handleSpecialtyChange}
            size={5}
          >
            <option value="">-- Chọn chuyên khoa --</option>
            {specialties.map(specialty => (
              <option key={specialty._id} value={specialty._id}>
                {specialty.specialtyName}
              </option>
            ))}
          </select>
          {validationErrors.specialties && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.specialties}</p>
          )}

          {/* Selected specialties tags */}
          {doctorProfile.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {doctorProfile.specialties.map(id => {
                const spec = specialties.find(s => s._id === id);
                return (
                  <span
                    key={id}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {spec?.specialtyName}
                    <button
                      type="button"
                      onClick={() => handleSpecialtyChange({ target: { value: id } })}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Years of Experience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số Năm Kinh Nghiệm *
          </label>
          <input
            type="number"
            min="0"
            max="50"
            className={`border ${validationErrors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-custom-blue focus:border-custom-blue`}
            placeholder="Nhập số năm kinh nghiệm"
            value={doctorProfile.yearsOfExperience}
            onChange={(e) => setDoctorProfile(prev => ({
              ...prev,
              yearsOfExperience: e.target.value
            }))}
          />
          {validationErrors.yearsOfExperience && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.yearsOfExperience}</p>
          )}
        </div>

        {/* Description Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô Tả Chuyên Môn *
          </label>
          <div className={`border ${validationErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden`}>
            <CKEditor
              editor={ClassicEditor}
              data={doctorProfile.description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setDoctorProfile(prev => ({ ...prev, description: data }));
              }}
              config={{
                placeholder: "Mô tả chi tiết về chuyên môn, kinh nghiệm và phương pháp điều trị...",
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote']
              }}
            />
          </div>
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Ít nhất 50 ký tự</p>
        </div>

        {/* Certificates Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chứng Chỉ Hành Nghề (Tối đa 5 file)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Nhấn để tải lên</span> hoặc kéo thả file
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF (Tối đa 5MB mỗi file)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf"
                disabled={images.length >= 5}
              />
            </label>
          </div>

          {/* Uploaded files preview */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative border rounded-lg overflow-hidden group">
                  {image.file.type.startsWith('image/') ? (
                    <img
                      src={image.preview}
                      alt={`preview-${index}`}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500">PDF File</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-white bg-red-500 hover:bg-red-600 rounded-full p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                    {image.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          {images.length >= 5 && (
            <p className="mt-2 text-sm text-yellow-600">Bạn đã đạt tối đa 5 file đính kèm</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-custom-blue text-white px-6 py-2 rounded-lg hover:bg-custom-bluehover2 transition flex items-center ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? "Đang xử lý..." : "Tạo Hồ Sơ"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateDoctorProfilePage;