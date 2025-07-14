import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getNewsById } from "../services/newsService";
import { toast } from "sonner";

function NewPaper() {
  const location = useLocation();
  const navigate = useNavigate();
  const newsId = location.state?.id;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!newsId) {
      toast.error("Không tìm thấy ID bài viết. Quay lại");
      navigate("/news");
      return;
    }

    const fetchNewsDetail = async () => {
      try {
        const response = await getNewsById(newsId);
        setNews(response.data);
      } catch (err) {
        toast.error("Lỗi khi tải bài viết: " + err.message);
        navigate("/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Đang tải nội dung bài viết...</p>
      </div>
    );
  }

  if (!news) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
      <div className="text-sm text-gray-600 mb-6">
        {news.category || "Chưa phân loại"} - {new Date(news.createdAt).toLocaleDateString("vi-VN")}
      </div>

      {news.blocks.map((block, idx) => {
        if (block.type === "text") {
          return (
            <p key={idx} className="text-base leading-relaxed my-4">
              {block.content}
            </p>
          );
        }
        if (block.type === "image") {
          return (
            <img
              key={idx}
              src={block.content}
              alt={`image-${idx}`}
              className="w-full rounded-lg shadow-md my-6"
            />
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4"
            >
              {block.content}
            </blockquote>
          );
        }
        if (block.type === "video") {
          return (
            <div key={idx} className="my-6">
              <iframe
                src={block.content}
                title={`video-${idx}`}
                frameBorder="0"
                allowFullScreen
                className="w-full aspect-video rounded-md"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default NewPaper;
