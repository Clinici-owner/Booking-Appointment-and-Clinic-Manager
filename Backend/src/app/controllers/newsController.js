const News = require('../models/News');

class NewsController {
  async createNews(req, res) {
    try {
      const { title, blocks, tags = [], category } = req.body;

      if (!title || !Array.isArray(blocks) || blocks.length === 0) {
        return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung bài viết" });
      }

      

      const news = await News.create({
        title,
        blocks,
        tags,
        category,
        });

      return res.status(201).json({ message: "Tạo bài viết thành công", data: news });
    } catch (error) {
      console.error("Error in createNews:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  async getAllNews(req, res) {
    try {
      const { tag, category } = req.query;
      const filter = {};

      if (tag) filter.tags = tag;
      if (category) filter.category = category;

      const newsList = await News.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({ message: "Lấy danh sách thành công", data: newsList });
    } catch (error) {
      console.error("Error in getAllNews:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  async getNewsById(req, res) {
    try {
      const { id } = req.params;
      const news = await News.findById(id).populate("createdBy", "name");

      if (!news) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      return res.status(200).json({ message: "Lấy bài viết thành công", data: news });
    } catch (error) {
      console.error("Error in getNewsById:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  async updateNews(req, res) {
    try {
      const { id } = req.params;
      const { title, blocks, tags, category } = req.body;

      const news = await News.findById(id);
      if (!news) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

     

      news.title = title || news.title;
      news.blocks = blocks || news.blocks;
      news.tags = tags || news.tags;
      news.category = category || news.category;

      const updated = await news.save();

      return res.status(200).json({ message: "Cập nhật thành công", data: updated });
    } catch (error) {
      console.error("Error in updateNews:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  async deleteNews(req, res) {
    try {
      const { id } = req.params;
      const news = await News.findById(id);

      if (!news) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      

      await News.findByIdAndDelete(id);
      return res.status(200).json({ message: "Xoá bài viết thành công" });
    } catch (error) {
      console.error("Error in deleteNews:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}

module.exports = new NewsController();
