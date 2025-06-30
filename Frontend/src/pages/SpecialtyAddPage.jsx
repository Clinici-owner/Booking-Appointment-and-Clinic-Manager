import React, { useState, useRef, useEffect } from "react";

import { Toaster, toast } from "sonner";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { uploadToCloudinary } from "../services/documentUploadService";
import {
  createSpecialty,
  updateSpecialty,
  getSpecialtyById,
} from "../services/specialtyService";

import { uploadDocument } from "../services/documentUploadService";

import { useParams, useNavigate } from "react-router-dom";

function SpecialtyAddPage() {
  const { id } = useParams();
  const navigator = useNavigate();

  const [checkUpdate, setCheckUpdate] = useState(false);

  console.log(checkUpdate);
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [dataSpecialty, setDataSpecialty] = useState({
    specialtyName: "",
    descspecialty: "",
    medicalFee: "",
    documentId: [],
    logo: "",
  });

  useEffect(() => {
    const fetchSpecialty = async () => {
      try {
        const data = await getSpecialtyById(id);
        setDataSpecialty({
          specialtyName: data.specialtyName || "",
          descspecialty: data.descspecialty || "",
          medicalFee: data.medicalFee || "",
          documentId: data.documentId || [],
          logo: data.logo || "",
        });
        setLogo(data.logo || null);
        setCheckUpdate(true);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu chuyên khoa:", error);
      }
    };

    if (id) {
      fetchSpecialty();
    }
  }, [id]); // <- chạy lại khi id thay đổi

  useEffect(() => {
    if (checkUpdate && dataSpecialty.documentId?.length > 0) {
      const normalized = dataSpecialty.documentId.map((url) => ({
        src: url.file_path,
        isLocal: false,
      }));
      console.log("Normalized images:", normalized);

      setImages(normalized);
    }
  }, [checkUpdate, dataSpecialty]);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let logoUrl = "";
    let documentIds = [];

    // Chuẩn bị dữ liệu để gửi

    if (
      !dataSpecialty.specialtyName.trim() ||
      !dataSpecialty.descspecialty.trim() ||
      !dataSpecialty.medicalFee ||
      images.length === 0 ||
      !logo
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi gửi.");
      return;
    }

    if (logo) {
      logoUrl = await uploadToCloudinary(logo);
    }

    if (images && images.length > 0) {
      const uploadedUrls = await Promise.all(
        images.map((img) => uploadToCloudinary(img.file))
      );
      // Upload lên Cloudinary

      const insertedDocuments = await Promise.all(
        uploadedUrls.map((url) => uploadDocument(url)) // Lưu vào MongoDB
      );

      documentIds = insertedDocuments.map((doc) => doc.document._id);
    }

    const payload = {
      specialtyName: dataSpecialty.specialtyName,
      descspecialty: dataSpecialty.descspecialty,
      medicalFee: dataSpecialty.medicalFee,
      documentId: documentIds,
      logo: logoUrl,
    };
    try {
      await createSpecialty(payload);
      setDataSpecialty({
        specialtyName: "",
        descspecialty: "",
        medicalFee: "",
        documentId: [],
        logo: "",
      });
      setImages([]);
      setLogo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      if (logoInputRef.current) {
        logoInputRef.current.value = null;
      }

      toast.success("Tạo chuyên khoa thành công");
    } catch (error) {
      console.error("Tạo chuyên khoa thất bại:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileObjs = files.map((file) => ({
      src: URL.createObjectURL(file),
      file: file,
      isLocal: true,
    }));

    setImages((prev) => [...prev, ...fileObjs]);
  };

  // Handle file input change for logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    let logoUrl = "";
    let documentIds = [];

    // Kiểm tra dữ liệu
    if (
      !dataSpecialty.specialtyName.trim() ||
      !dataSpecialty.descspecialty.trim() ||
      !dataSpecialty.medicalFee ||
      images.length === 0 ||
      !logo
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi gửi.");
      return;
    }

    // Upload logo mới
    if (logo && typeof logo !== "string") {
      // Nếu là file mới => upload
      logoUrl = await uploadToCloudinary(logo);
    } else if (typeof logo === "string") {
      // Nếu là chuỗi (ảnh cũ từ DB) => giữ nguyên
      logoUrl = logo;
    }

    // Chỉ upload ảnh mới
    const newLocalImages = images.filter((img) => img.isLocal);

    if (newLocalImages.length > 0) {
      const uploadedUrls = await Promise.all(
        newLocalImages.map((img) => uploadToCloudinary(img.file))
      );

      const insertedDocuments = await Promise.all(
        uploadedUrls.map((url) => uploadDocument(url))
      );

      documentIds = insertedDocuments.map((doc) => doc.document._id);
    }

    const payload = {
      specialtyName: dataSpecialty.specialtyName,
      descspecialty: dataSpecialty.descspecialty,
      medicalFee: dataSpecialty.medicalFee,
      documentId: documentIds, // ← chỉ ảnh mới
      logo: logoUrl,
    };

    try {
      await updateSpecialty(id, payload);
      // Reset
      setDataSpecialty({
        specialtyName: "",
        descspecialty: "",
        medicalFee: "",
        documentId: [],
        logo: "",
      });
      setImages([]);
      setLogo(null);
      fileInputRef.current && (fileInputRef.current.value = null);
      logoInputRef.current && (logoInputRef.current.value = null);
      toast.success("Cập nhật chuyên khoa thành công");
      navigator(`/admin/specialties/${id}`); // Chuyển hướng về danh sách chuyên khoa
    } catch (error) {
      console.error("Cập nhật chuyên khoa thất bại:", error);
    }
  };

  return (
    <div>
      <Toaster position="top-right" richColors />
      <h1 className="text-3xl text-custom-blue font-bold mb-4">
        {checkUpdate ? "Cập nhật chuyên khoa" : "Thêm chuyên khoa"}
      </h1>
      <form
        onSubmit={checkUpdate ? handleUpdate : handleSubmit}
        className="space-y-4"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Tên chuyên khoa
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Nhập tên chuyên khoa"
            value={dataSpecialty.specialtyName}
            onChange={(e) =>
              setDataSpecialty((prev) => ({
                ...prev,
                specialtyName: e.target.value,
              }))
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mô tả chuyên khoa
          </label>
          <CKEditor
            editor={ClassicEditor}
            data={dataSpecialty.descspecialty}
            onChange={(event, editor) => {
              const data = editor.getData();
              setDataSpecialty((prev) => ({
                ...prev,
                descspecialty: data,
              }));
            }}
            onBlur={(event, editor) => {
              const data = editor.getData();
              setDataSpecialty((prev) => ({
                ...prev,
                descspecialty: data,
              }));
            }}
            config={{
              placeholder: "Nhập mô tả dịch vụ...",
            }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Phí khám bệnh
          </label>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Nhập phí khám bệnh"
            value={dataSpecialty.medicalFee}
            onChange={(e) =>
              setDataSpecialty((prev) => ({
                ...prev,
                medicalFee: e.target.value,
              }))
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Hình ảnh về chuyên khoa
          </label>
          <input
            type="file"
            className="border border-gray-300 rounded-lg p-2 w-full"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            accept="image/*"
          />

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.src}
                  alt={`preview-${index}`}
                  className="rounded-lg object-cover w-full h-40"
                />
              ))}
            </div>
          )}
        </div>
        <div className="mb-4 ">
          <label className="block text-sm font-medium mb-2">
            Logo chuyên khoa
          </label>
          <input
            type="file"
            onChange={handleLogoChange}
            ref={logoInputRef}
            accept="image/*"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {logo &&
              (typeof logo === "string" ? (
                <img
                  src={logo} // link ảnh từ backend
                  alt="Logo preview"
                  className="rounded-lg object-cover w-full h-40"
                />
              ) : (
                <img
                  src={URL.createObjectURL(logo)} // ảnh mới upload từ input type="file"
                  alt="Logo preview"
                  className="rounded-lg object-cover w-full h-40"
                />
              ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-custom-blue text-white px-4 py-2 rounded-xl hover:bg-custom-bluehover2 transition"
        >
          {checkUpdate ? "Cập nhật chuyên khoa" : "Thêm chuyên khoa"}
        </button>
      </form>
    </div>
  );
}

export default SpecialtyAddPage;
