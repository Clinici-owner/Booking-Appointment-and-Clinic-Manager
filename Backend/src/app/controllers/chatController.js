const axios = require("axios");
const { getValidKey } = require("../utils/geminiKeyManager");

class ChatController {
  async askGemini(req, res) {
    const { prompt } = req.body;
    const apiKey = getValidKey();

    if (!apiKey) {
      return res.status(429).json({ error: "Tất cả API key đã hết lượt trong ngày. Vui lòng thử lại sau." });
    }

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Thiếu nội dung prompt." });
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Bạn là một trợ lý y tế AI có nhiệm vụ tiếp nhận các triệu chứng do người dùng mô tả và thực hiện:

1. Gợi ý chuyên khoa phù hợp mà người dùng nên đến khám.
2. Đề xuất các biện pháp xử lý tạm thời tại nhà nếu tình trạng không nguy hiểm ngay.
3. Cảnh báo nếu có dấu hiệu cần đi khám hoặc cấp cứu ngay lập tức.
4. Trình bày ngắn gọn, rõ ràng, dễ hiểu, tránh dùng thuật ngữ y học chuyên sâu.
5. Trả lời dưới dạng 3 mục rõ ràng: 
   - Chuyên khoa
   - Xử lý tạm thời
   - Cảnh báo

Triệu chứng người dùng: ${prompt}`
                }
              ]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        return res.status(500).json({ error: "Không nhận được phản hồi từ Gemini." });
      }

      return res.status(200).json({ reply });

    } catch (err) {
      console.error("Lỗi gọi Gemini:", err.response?.data || err.message);
      return res.status(500).json({
        error: "Không thể xử lý yêu cầu.",
        detail: err.response?.data || err.message,
      });
    }
  }
}

module.exports = new ChatController();
