import axios from "axios";

const API_URL = "http://localhost:3000/api/documents";

export const uploadDocument = async (file_path) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, { file_path: file_path });
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "specialty"); // 🔁 Thay bằng upload preset thật

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dfoappgig/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url; 
  } catch (err) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", err);
    return null;
  }
};

