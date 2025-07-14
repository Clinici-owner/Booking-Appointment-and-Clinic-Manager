import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getNewsById, updateNews, uploadToCloudinary } from "../services/newsService";
import { Toaster, toast } from "sonner";
import {
    Button,
    TextField,
    TextareaAutosize,
    Box,
    Typography,
    IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/CloudUpload";

const NewsEditPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const newsId = location.state?.id;

    const [title, setTitle] = useState("");
    const [blocks, setBlocks] = useState([]);
    const [tags, setTags] = useState("");
    const [category, setCategory] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleImageReplace = async (index, file) => {
        if (!file) return;
        setUploading(true);
        const url = await uploadToCloudinary(file);
        setUploading(false);

        if (url) {
            const newBlocks = [...blocks];
            newBlocks[index].content = url;
            setBlocks(newBlocks);
        }
    };

    useEffect(() => {
        if (!newsId) {
            toast.error("Không tìm thấy ID bài viết");
            navigate("/news");
            return;
        }

        const fetchData = async () => {
            try {
                const res = await getNewsById(newsId);
                const data = res.data;
                setTitle(data.title || "");
                setBlocks(data.blocks || []);
                setTags((data.tags || []).join(", "));
                setCategory(data.category || "");
            } catch (err) {
                toast.error("Lỗi tải dữ liệu bài viết", err);
                navigate("/news");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [newsId, navigate]);

    const handleAddText = () => {
        setBlocks([...blocks, { type: "text", content: "", order: blocks.length }]);
    };

    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const url = await uploadToCloudinary(file);
            setUploading(false);
            if (url) {
                setBlocks([
                    ...blocks,
                    {
                        type: "image",
                        content: url,
                        order: blocks.length
                    }
                ]);
            }
        }
    };

    const handleTextChange = (index, value) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = value;
        setBlocks(newBlocks);
    };

    const handleSubmit = async () => {
        if (!title.trim() || blocks.length === 0) {
            toast.error("Vui lòng nhập tiêu đề và nội dung bài viết.");
            return;
        }

        try {
            await updateNews(newsId, {
                title,
                blocks,
                tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
                category
            });
            toast.success("Cập nhật bài viết thành công!");
            navigate("/news");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật: " + (err?.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <p>Đang tải dữ liệu bài viết...</p>;
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Toaster position="top-right" richColors />
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa bài viết
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
                        <>
                            <img
                                src={block.content}
                                alt=""
                                style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 8 }}
                            />

                            <label htmlFor={`replace-image-${idx}`}>
                                <input
                                    id={`replace-image-${idx}`}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleImageReplace(idx, e.target.files[0])}
                                />
                                <Button size="small" variant="outlined" component="span">
                                    Thay ảnh
                                </Button>
                            </label>
                        </>
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

                <label htmlFor="image-upload">
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAddImage}
                        style={{ display: "none" }}
                    />
                    <IconButton color="primary" component="span" sx={{ ml: 2 }}>
                        <UploadIcon />
                    </IconButton>
                </label>
            </Box>

            <Box sx={{ display: "flex", gap: 2, marginTop: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={uploading}
                >
                    {uploading ? "Đang tải ảnh..." : "Cập nhật bài viết"}
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/news")}
                >
                    Quay về danh sách bài viết
                </Button>
            </Box>
        </Box>
    );
};

export default NewsEditPage;