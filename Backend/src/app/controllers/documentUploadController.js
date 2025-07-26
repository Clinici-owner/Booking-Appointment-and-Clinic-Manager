const DocumentUpload = require("../models/DocumentUpload");

class DocumentUploadController {
  async uploadDocument(req, res) {
    try {
      const { file_path } = req.body;
      if (!file_path) {
        return res.status(400).json({ error: "URL hình ảnh là bắt buộc." });
      }

      const document = new DocumentUpload({ file_path });
      await document.save();
      res
        .status(201)
        .json({ message: "Tệp đã được tải lên thành công.", document });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "specialty"); 

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
      console.error("Lỗi khi upload ảnh:", err);
      return null;
    }
  }
}

module.exports = new DocumentUploadController();
