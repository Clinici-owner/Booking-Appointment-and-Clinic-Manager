import React, { useState } from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { uploadToCloudinary } from "../services/documentUploadService";
import { createSpecialty } from "../services/specialtyService"; // Giả sử bạn có một service để tạo chuyên khoa
import { uploadDocument } from "../services/documentUploadService"; // Giả sử bạn có một service để upload tài liệu

function SpecialtyAddPage() {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);
  const [dataSpecialty, setDataSpecialty] = useState({
    specialtyName: "",
    descspeciality: "",
    medicalFee: "",
    documentId: [],
    logo: "",
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let logoUrl = "";
    let documentIds = [];

    if (logo) {
      logoUrl = await uploadToCloudinary(logo);
    }


    if (images && images.length > 0) {
      const uploadedUrls = await Promise.all(images.map(uploadToCloudinary)); // Upload lên Cloudinary

      const insertedDocuments = await Promise.all(
        uploadedUrls.map((url) => uploadDocument(url)) // Lưu vào MongoDB
      );

      documentIds = insertedDocuments.map((doc) => doc.document._id);
    }

    // Chuẩn bị dữ liệu để gửi
    const payload = {
      specialtyName: dataSpecialty.specialtyName,
      descspeciality: dataSpecialty.descspeciality,
      medicalFee: dataSpecialty.medicalFee,
      documentId: documentIds,
      logo: logoUrl,
    };

    try {
      const result = await createSpecialty(payload);
      console.log("Tạo chuyên khoa thành công:", result);
    } catch (error) {
      console.error("Tạo chuyên khoa thất bại:", error);
    }
  };

  // Handle file input change for images

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // Handle file input change for logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    console.log("Logo file selected:", file);
  };

  return (
    <div>
      <h1 className="text-3xl text-custom-blue font-bold mb-4">
        Thêm chuyên khoa
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              setDataSpecialty({
                ...dataSpecialty,
                specialtyName: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mô tả chuyên khoa
          </label>
          <CKEditor
            editor={ClassicEditor}
            data={dataSpecialty.descspeciality}
            onChange={(event, editor) => {
              const data = editor.getData();
              setDataSpecialty({ ...dataSpecialty, descspeciality: data });
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
              setDataSpecialty({ ...dataSpecialty, medicalFee: e.target.value })
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
            accept="image/*"
          />

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
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
            accept="image/*"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          {logo && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <img
                src={URL.createObjectURL(logo)}
                alt="Logo preview"
                className="rounded-lg object-cover w-full h-40"
              />
            </div>
          )}
        </div>
        <button className="bg-custom-blue text-white px-4 py-2 rounded-xl hover:bg-custom-bluehover2 transition">
          Thêm chuyên khoa
        </button>
      </form>
    </div>
  );
}

export default SpecialtyAddPage;
