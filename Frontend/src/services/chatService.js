import axios from "axios";

export const askMedicalAI = async (prompt) => {
  const res = await axios.post("http://localhost:3000/api/chat/ask", { prompt });
  return res.data.reply;
};

const bannedKeywords = [
  "chat sex", "xxx", "sex", "nude", "ảnh nóng", "18+", "nội dung 18+", "phim sex", "phim người lớn",

  "ngu", "đần", "óc chó", "khùng", "bậy", "chửi", "dốt", "điên", "địt", "lồn", "cặc", "fuck", "shit", "dm", "vkl", "vcl",

  "chơi game", "thời tiết", "đố vui", "truyện cười", "truyện ma", "tiểu thuyết", "thơ ca", "gái xinh", "idol", "tình yêu", "tâm sự", "tâm linh",

  "tôn giáo", "phật", "chúa", "allah", "hồi giáo", "thiên chúa", "chính trị", "cộng sản", "quốc hội", "chính quyền", "trùm", "trùm mafia", "chế độ",

  "vũ khí", "bom", "súng", "giết người", "khủng bố", "đánh nhau", "máu me", "tự tử", "tự sát", "gây án", "đầu độc", "cá độ", "cướp"
];

export function isPromptValid(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  return !bannedKeywords.some((word) => lowerPrompt.includes(word));
}