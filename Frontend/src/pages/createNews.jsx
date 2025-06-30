import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNews, uploadToCloudinary } from "../services/newsService";
import { Button, TextField, TextareaAutosize, Box, Typography, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/CloudUpload';

const NewsCreatePage = () => {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [tags, setTags] = useState(""); 
  const [category, setCategory] = useState("");
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
  if (blocks.length === 0) {
    alert("Vui lòng thêm ít nhất một đoạn văn hoặc hình ảnh.");
    return;
  }

  try {
    await createNews({
      title,
      blocks,
      tags: tags.split(","),
      category: category || "Thông báo",
    });
    alert("Tạo bài viết thành công!");
    navigate("/news");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tạo bài viết");
  }
};

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tạo bài viết
      </Typography>

      <TextField
        label="Tiêu đề bài viết"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Tags (cách nhau bằng dấu phẩy)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Danh mục"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ marginBottom: 2 }}
      />

      {blocks.map((block, idx) => (
        <Box key={idx} sx={{ marginBottom: 2 }}>
          {block.type === "text" ? (
            <TextareaAutosize
              minRows={4}
              placeholder="Nội dung đoạn văn"
              value={block.content}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          ) : block.type === "image" ? (
            <img
              src={block.content.url}
              alt=""
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : null}
        </Box>
      ))}

      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddText}
        >
          Thêm đoạn văn
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleAddImage}
          style={{ marginLeft: 16 }}
        />
        <IconButton color="primary" component="span" sx={{ marginLeft: 1 }}>
          <UploadIcon />
        </IconButton>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{
          marginTop: 3,
          padding: "10px 20px",
          borderRadius: 2,
        }}
      >
        Lưu bài viết
      </Button>
    </Box>
  );
};

export default NewsCreatePage;
