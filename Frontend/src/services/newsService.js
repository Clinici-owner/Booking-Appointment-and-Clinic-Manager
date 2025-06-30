import axios from "axios";
const API_URL = "http://localhost:3000/api/news";
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "specialty"); 

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dfoappgig/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Lỗi khi upload ảnh lên Cloudinary:", err);
    return null;
  }
};

export const createNews = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
  
export const getNewsById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const listNews = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
