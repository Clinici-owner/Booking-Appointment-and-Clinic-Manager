import axios from "axios";

const API_URL = "http://localhost:3000/api/news";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "specialty");

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dfoappgig/image/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.secure_url;
  } catch (err) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", err);
    return null;
  }
};

export const createNews = async (data) => {
  const res = await axios.post(API_URL, data);  // Không cần config headers
  return res.data;
};



// 📄 Lấy bài viết theo ID
export const getNewsById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// 📋 Lấy danh sách bài viết
export const listNews = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
