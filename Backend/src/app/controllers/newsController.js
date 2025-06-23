const News = require('../models/News');

class NewsController {
  async createNews(req, res) {
    try {
      const { title, blocks, tags, category } = req.body;

      if (!title || !Array.isArray(blocks)) {
        return res.status(400).json({ message: "Thiếu tiêu đề hoặc blocks" });
      }

      const news = await News.create({
      title,
      blocks,
      tags,
      category,
      createdBy: req.user._id, 
    });

      await news.save();
      return res.status(201).json({ message: "Tạo bài viết thành công", news });
    } catch (error) {
      console.error("Error creating news:", error);
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
      return res.status(200).json({ news: newsList });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getNewsById(req, res) {
    try {
      const { id } = req.params;
      const news = await News.findById(id).populate("createdBy", "name");

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.status(200).json({ news });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateNews(req, res) {
    try {
      const { id } = req.params;
      const { title, blocks, tags, category } = req.body;

      const updated = await News.findByIdAndUpdate(
        id,
        { title, blocks, tags, category },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.status(200).json({ message: "Updated successfully", news: updated });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async deleteNews(req, res) {
    try {
      const { id } = req.params;
      const deleted = await News.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.status(200).json({ message: "News deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new NewsController();
