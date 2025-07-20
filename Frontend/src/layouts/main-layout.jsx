import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReactMarkdown from "react-markdown";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { askMedicalAI, isPromptValid } from "../services/chatService";
import { getOpenSpecialties } from "../services/specialtyService";

function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return visible && (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      variant="default"
      size="icon"
      round="full"
      className="fixed bottom-8 right-8 z-50 bg-custom-blue text-white shadow-lg hover:bg-custom-bluehover2 transition"
      aria-label="Lên đầu trang"
    >
      <ArrowUpwardIcon />
    </Button>
  );
}

function ChatToggleButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      size="icon"
      round="full"
      className="fixed bottom-8 right-20 z-50 bg-custom-blue text-white shadow-lg hover:bg-custom-bluehover2 transition"
      aria-label="Trợ lý AI"
    >
      <ChatBubbleOutlineIcon />
    </Button>
  );
}



function MainLayout({ children }) {
  const [showChat, setShowChat] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [specialtyList, setSpecialtyList] = React.useState([]);
  const [greetingShown, setGreetingShown] = React.useState(false);

  React.useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const result = await getOpenSpecialties();
        setSpecialtyList(result || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách chuyên khoa:", err);
      }
    };
    fetchSpecialties();
  }, []);

  const generateSystemPrompt = () => {
    const names = specialtyList.map((s) => s.name).join(", ");
    return `Bạn là một trợ lý y tế AI có nhiệm vụ tiếp nhận các triệu chứng do người dùng mô tả và thực hiện:

1. Gợi ý chuyên khoa phù hợp mà người dùng nên đến khám (chỉ chọn từ các chuyên khoa sau: ${names}).
2. Đề xuất các biện pháp xử lý tạm thời tại nhà nếu tình trạng không nguy hiểm ngay.
3. Cảnh báo nếu có dấu hiệu cần đi khám hoặc cấp cứu ngay lập tức.
4. Trình bày ngắn gọn, rõ ràng, dễ hiểu, tránh dùng thuật ngữ y học chuyên sâu.
5. Trả lời dưới dạng 3 mục rõ ràng:
   - Chuyên khoa
   - Xử lý tạm thời
   - Cảnh báo`;
  };

  const handleToggleChat = () => {
    setShowChat((prev) => {
      const next = !prev;
      if (next && !greetingShown) {
        setMessages((prevMsgs) => [
          ...prevMsgs,
          {
            role: "assistant",
            content: "👋 Xin chào! Tôi là trợ lý y tế AI. Vui lòng mô tả triệu chứng để tôi hỗ trợ bạn nhé!",
          },
        ]);
        setGreetingShown(true);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isPromptValid(input)) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        {
          role: "assistant",
          content: "Nội dung bạn nhập không phù hợp. Vui lòng chỉ nhập các triệu chứng y tế hợp lệ (ví dụ: đau bụng, khó thở, sốt cao...).",
        },
      ]);
      setInput("");
      return;
    }

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await askMedicalAI(input, generateSystemPrompt());
      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Lỗi gọi API Gemini:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Đã xảy ra lỗi khi xử lý yêu cầu." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div>{children}</div>
      <Footer />
      <ScrollToTopButton />
      <ChatToggleButton onClick={handleToggleChat} />

      {showChat && (
        <div className="fixed bottom-24 right-8 w-[350px] h-[480px] bg-white border rounded-xl border-[#ccc] shadow-2xl z-50 flex flex-col">
          <div className="p-3 border-b text-center text-base font-bold bg-custom-blue rounded-t-xl text-white shadow-sm tracking-wide uppercase">
            Trợ lý triệu chứng
          </div>
          <div className="flex-1 p-2 overflow-y-auto" id="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`text-sm my-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <span className={`inline-block px-3 py-1 rounded-md ${msg.role === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
                  <ReactMarkdown
                    components={{
                      p({ children }) {
                        const text = Array.isArray(children)
                          ? children.map(c => (typeof c === "string" ? c : "")).join("")
                          : typeof children === "string"
                            ? children
                            : "";

                        if (text.includes("Chuyên khoa")) {
                          return <p className="flex items-start gap-1"><LocalHospitalIcon fontSize="small" className="mt-1" />{children}</p>;
                        }
                        if (text.includes("Xử lý tạm thời")) {
                          return <p className="flex items-start gap-1"><HomeRepairServiceIcon fontSize="small" className="mt-1" />{children}</p>;
                        }
                        if (text.includes("Cảnh báo") || text.includes("Lưu ý")) {
                          return <p className="flex items-start gap-1 text-red-600 font-semibold"><WarningAmberIcon fontSize="small" className="mt-1" />{children}</p>;
                        }
                        return <p>{children}</p>;
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập triệu chứng của bạn..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-custom-blue text-white px-4 py-3 rounded-lg text-base hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "..." : "Gửi"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
