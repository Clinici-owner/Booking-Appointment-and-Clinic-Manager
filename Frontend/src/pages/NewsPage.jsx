import React, { useEffect, useState } from "react";
import { listNews } from "../services/newsService";
import NewsCard from "../components/NewsCard";

function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));

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
            <NewsCard key={news._id} news={news} isAdmin={user?.role === "admin"} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsPage;
