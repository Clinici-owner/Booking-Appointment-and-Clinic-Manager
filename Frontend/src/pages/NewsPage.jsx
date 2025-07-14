import React, { useEffect, useState } from "react";
import { listNews } from "../services/newsService";
import NewsCard from "../components/NewsCard";

function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

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

  const filteredAndSortedNews = newsList
    .filter((news) =>
      news.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Tin tức mới nhất</h1>
      <p className="mb-8">Cập nhật các tin tức và thông báo từ hệ thống.</p>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề bài viết..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-1/2"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded-md w-full md:w-1/4"
        >
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>
      </div>

      {/* Danh sách bài viết */}
      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredAndSortedNews.length === 0 ? (
        <p>Không có bài viết nào phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedNews.map((news) => (
            <NewsCard
              key={news._id}
              news={news}
              isAdmin={user?.role === "admin"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsPage;
