import React, { useState } from "react";

function SpecialtyAddPage() {
  const [images, setImages] = useState([]);
  const [logo, setLogo] = useState(null);

  // Handle file input change for images

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // Handle file input change for logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };

  return (
    <div>
      <h1 className="text-3xl text-custom-blue font-bold mb-4">
        Thêm chuyên khoa
      </h1>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Tên chuyên khoa
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Nhập tên chuyên khoa"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mô tả chuyên khoa
          </label>
          <textarea
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Nhập mô tả chuyên khoa"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Phí khám bệnh
          </label>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Nhập phí khám bệnh"
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
