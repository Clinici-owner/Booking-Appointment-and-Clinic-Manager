import React, { useEffect, useState } from "react";
import { listNews } from "../services/newsService";
import { Link } from "react-router-dom";

function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await listNews();
        setNewsList(response.data || []);
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
        setError("Không thể tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Tin tức mới nhất</h1>
      <p className="mb-8">Cập nhật các tin tức và thông báo từ hệ thống.</p>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : newsList.length === 0 ? (
        <p>Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map((news) => (
            <Link
              key={news._id}
              to={`/news/${news._id}`}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
              <p className="text-sm text-gray-600">
                {news.category || "Chưa phân loại"} -{" "}
                {new Date(news.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <p className="mt-2 text-gray-800 line-clamp-2">
                {
                  news.blocks?.find((b) => b.type === "text")?.content?.slice(0, 100) || "..."
                }
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsPage;
