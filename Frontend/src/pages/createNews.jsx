import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNews, uploadToCloudinary } from "../services/newsService";

const NewsCreatePage = () => {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();

  const handleAddText = () => {
    setBlocks([...blocks, { type: "text", content: "", order: blocks.length }]);
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadToCloudinary(file);
      if (url) {
        setBlocks([...blocks, { type: "image", content: { url }, order: blocks.length }]);
      }
    }
  };

  const handleTextChange = (index, value) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = value;
    setBlocks(newBlocks);
  };

  const handleSubmit = async () => {
    try {
      await createNews({
        title,
        blocks,
        tags: ["tin tức"],
        category: "Thông báo",
      });
      alert("Tạo bài viết thành công!");
      navigate("/news");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài viết");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Tạo bài viết</h2>

      <input
        placeholder="Tiêu đề bài viết"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: 16, padding: 8 }}
      />

      {blocks.map((block, idx) => (
        <div key={idx} style={{ marginBottom: 16 }}>
          {block.type === "text" ? (
            <textarea
              placeholder="Nội dung đoạn văn"
              value={block.content}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              style={{ width: "100%", height: 100, padding: 8 }}
            />
          ) : block.type === "image" ? (
            <img
              src={block.content.url}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : null}
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleAddText}>+ Thêm đoạn văn</button>
        <input type="file" accept="image/*" onChange={handleAddImage} style={{ marginLeft: 16 }} />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 24,
          backgroundColor: "#1976d2",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: 4,
        }}
      >
        Lưu bài viết
      </button>
    </div>
  );
};

export default NewsCreatePage;
