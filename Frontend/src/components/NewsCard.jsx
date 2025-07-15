import React from "react";
import { useNavigate } from "react-router-dom";
import NewsContentBlock from "./NewsBlock";
import { toast } from "sonner";
import { deleteNews } from "../services/newsService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function NewsCard({ news, isAdmin = false }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/admin/news/edit", { state: { id: news._id } });
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xoá bài viết này?")) {
      try {
        await deleteNews(news._id);
        toast.success("Đã xoá bài viết");
        window.location.reload(); 
      } catch (err) {
        toast.error("Lỗi khi xoá bài viết", err);
      }
    }
  };

  const handleView = () => {
    navigate("/paper", { state: { id: news._id } });
  };

  const firstTextBlock = news.blocks.find((b) => b.type === "text");

  return (
    <div
      className="border rounded-lg p-4 hover:shadow transition bg-white relative"
      onClick={handleView}
    >
      <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
      <p className="text-sm text-gray-600">
        {news.category || "Chưa phân loại"} -{" "}
        {new Date(news.createdAt).toLocaleDateString("vi-VN")}
      </p>

      {firstTextBlock ? (
        <NewsContentBlock block={firstTextBlock} isPreview />
      ) : (
        <p className="text-sm text-gray-500 italic mt-2">Không có mô tả</p>
      )}

      {isAdmin && (
        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
            <EditIcon fontSize="small" className="text-blue-600 hover:text-blue-800" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
            <DeleteIcon fontSize="small" className="text-red-600 hover:text-red-800" />
          </button>
        </div>
      )}
    </div>
  );
}

export default NewsCard;
