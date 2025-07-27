import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorService } from "../services/doctorService";
import { getAllSpecialties } from "../services/specialtyService";
import { uploadToCloudinary, uploadDocument } from "../services/documentUploadService";

function ViewDoctorProfilePage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    description: "",
    yearsOfExperience: 0,
    specialties: [],
    certificateId: [],
  });
  const [images, setImages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, specialtiesData] = await Promise.all([
          DoctorService.getDoctorProfileById(doctorId),
          getAllSpecialties(),
        ]);
        if (!isMounted) return;
        setProfile(profileData);
        setSpecialties(specialtiesData);
        setForm({
          description: profileData?.description || "",
          yearsOfExperience: profileData?.yearsOfExperience || 0,
          specialties: profileData?.specialties?.map(s => s._id) || [],
          certificateId: profileData?.certificateId?.map(c => c._id) || [],
        });
      } catch (err) {
        if (isMounted) setError("Không tìm thấy hồ sơ bác sĩ hoặc có lỗi xảy ra.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (doctorId) fetchData();
    return () => { 
      isMounted = false; 
      images.forEach(image => URL.revokeObjectURL(image.preview)); 
    };
  }, [doctorId]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (form.specialties.length === 0) {
      errors.specialties = "Vui lòng chọn ít nhất một chuyên khoa";
    }
    if (!form.yearsOfExperience && form.yearsOfExperience !== 0) {
      errors.yearsOfExperience = "Vui lòng nhập số năm kinh nghiệm";
    } else if (isNaN(form.yearsOfExperience) || Number(form.yearsOfExperience) < 0) {
      errors.yearsOfExperience = "Số năm kinh nghiệm không hợp lệ";
    }
    if (!form.description || form.description.trim().length < 50) {
      errors.description = "Mô tả phải có ít nhất 50 ký tự";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecialtiesChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(selectedId)
        ? prev.specialties.filter(id => id !== selectedId)
        : [...prev.specialties, selectedId]
    }));
  };

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...files]);
  }, [images.length]);

  const removeImage = useCallback((index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const handleRemoveCertificate = (id) => {
    setForm(prev => ({
      ...prev,
      certificateId: prev.certificateId.filter(cid => cid !== id)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!validateForm()) return;
    
    let certificateId = [...form.certificateId];
    try {
      if (images.length > 0) {
        const uploadPromises = images.map(image =>
          uploadToCloudinary(image.file)
            .then(url => uploadDocument(url))
            .then(doc => doc.document._id)
        );
        const uploadedIds = await Promise.all(uploadPromises);
        certificateId = [...certificateId, ...uploadedIds];
      }
      
      const payload = {
        description: form.description,
        yearsOfExperience: Number(form.yearsOfExperience),
        specialties: form.specialties,
        certificateId,
      };
      
      await DoctorService.updateDoctorProfile(doctorId, payload);
      setSuccess(true);
      setEditMode(false);
      setImages([]);
      
      // Refetch profile
      const data = await DoctorService.getDoctorProfileById(doctorId);
      setProfile(data);
      setForm({
        description: data?.description || "",
        yearsOfExperience: data?.yearsOfExperience || 0,
        specialties: data?.specialties?.map(s => s._id) || [],
        certificateId: data?.certificateId?.map(c => c._id) || [],
      });
    } catch (err) {
      setError("Cập nhật hồ sơ thất bại. Vui lòng thử lại.", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Lỗi</p>
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
  
  if (!profile) return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Không tìm thấy hồ sơ bác sĩ</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-custom-bluehover2 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Hồ sơ bác sĩ</h2>
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mx-6 mt-4">
            <p className="font-bold">Thành công!</p>
            <p>Hồ sơ đã được cập nhật.</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!editMode ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin chung</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Mô tả</label>
                      <div className="mt-1 text-gray-700 whitespace-pre-line">
                        {profile.description || "Chưa có mô tả"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Số năm kinh nghiệm</label>
                      <div className="mt-1 text-gray-700">
                        {profile.yearsOfExperience} năm
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Chuyên khoa</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialties?.length > 0 ? (
                      profile.specialties.map(specialty => (
                        <span 
                          key={specialty._id} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {specialty.specialtyName}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Chưa có chuyên khoa</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Chứng chỉ hành nghề</h3>
                {profile.certificateId?.length > 0 || form.certificateId.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {profile.certificateId?.filter(c => form.certificateId.includes(c._id)).map((cert, idx) => {
                      const url = cert.file_path || cert.url;
                      if (!url) return null;
                      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      const isPdf = url.match(/\.pdf$/i);
                      
                      return (
                        <div key={cert._id || idx} className="relative group">
                          <div className="border rounded-lg overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
                            {isImage ? (
                              <img 
                                src={url} 
                                alt="Chứng chỉ" 
                                className="object-contain h-full w-full p-2"
                              />
                            ) : isPdf ? (
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center h-full w-full p-4 hover:bg-gray-100"
                              >
                                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-center text-gray-600">Xem PDF</span>
                              </a>
                            ) : (
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center h-full w-full p-4 hover:bg-gray-100"
                              >
                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-center text-gray-600">Tải xuống</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có chứng chỉ</h3>
                    <p className="mt-1 text-sm text-gray-500">Thêm chứng chỉ khi chỉnh sửa hồ sơ</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa *
                  {validationErrors.specialties && (
                    <span className="ml-2 text-sm text-red-600">{validationErrors.specialties}</span>
                  )}
                </label>
                <div className="mt-1">
                  <select
                    multiple
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    value={form.specialties}
                    onChange={handleSpecialtiesChange}
                    size={5}
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(specialty => (
                      <option key={specialty._id} value={specialty._id}>
                        {specialty.specialtyName}
                      </option>
                    ))}
                  </select>
                </div>
                {form.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.specialties.map(id => {
                      const spec = specialties.find(s => s._id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {spec?.specialtyName}
                          <button
                            type="button"
                            onClick={() => handleSpecialtiesChange({ target: { value: id } })}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                          >
                            <span className="sr-only">Remove</span>
                            <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                  Số năm kinh nghiệm *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="yearsOfExperience"
                    id="yearsOfExperience"
                    min="0"
                    max="50"
                    className={`block w-full pr-12 sm:text-sm rounded-md ${validationErrors.yearsOfExperience ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    placeholder="0"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">năm</span>
                  </div>
                </div>
                {validationErrors.yearsOfExperience && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.yearsOfExperience}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả chuyên môn *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border ${validationErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    placeholder="Mô tả chi tiết về chuyên môn, kinh nghiệm và phương pháp điều trị..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
                {validationErrors.description ? (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">Ít nhất 50 ký tự</p>
                )}
              </div>

              {/* Certificates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chứng chỉ hành nghề (Tối đa 5 file)
                </label>
                
                {/* Current certificates */}
                {(profile.certificateId?.length > 0 || form.certificateId.length > 0) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Chứng chỉ hiện có</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {profile.certificateId?.filter(c => form.certificateId.includes(c._id)).map((cert, idx) => {
                        const url = cert.file_path || cert.url;
                        if (!url) return null;
                        const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        
                        return (
                          <div key={cert._id || idx} className="relative group">
                            <div className="border rounded-lg overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
                              {isImage ? (
                                <img 
                                  src={url} 
                                  alt="Chứng chỉ" 
                                  className="object-contain h-full w-full p-2"
                                />
                              ) : (
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex flex-col items-center justify-center h-full w-full p-4 hover:bg-gray-100"
                                >
                                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs text-center text-gray-600">Tải xuống</span>
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCertificate(cert._id)}
                              className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-md hover:bg-red-100"
                              title="Xóa chứng chỉ"
                            >
                              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* File upload */}
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Tải lên file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          disabled={images.length >= 5}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF tối đa 5MB mỗi file
                    </p>
                    {images.length >= 5 && (
                      <p className="text-xs text-red-500">Đã đạt tối đa 5 file</p>
                    )}
                  </div>
                </div>

                {/* Preview new uploads */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">File mới tải lên</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="border rounded-lg overflow-hidden h-40 bg-gray-50 flex items-center justify-center">
                            {image.file.type.startsWith('image/') ? (
                              <img
                                src={image.preview}
                                alt={`preview-${index}`}
                                className="object-contain h-full w-full p-2"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full w-full p-4">
                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-center text-gray-600">PDF File</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-md hover:bg-red-100"
                            title="Xóa file"
                          >
                            <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {image.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewDoctorProfilePage;