import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button"; // Thêm dòng này


function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    visible && (
      <Button
        onClick={scrollToTop}
        variant="default"
        size="icon"
        round="full"
        className="fixed bottom-8 right-8 z-50 bg-custom-blue text-white shadow-lg hover:bg-custom-bluehover2 transition"
        aria-label="Lên đầu trang"
      >
        <span className="text-2xl">↑</span>
      </Button>
    )
  );
}

function MainLayout({ children }) {
  return (
    <div>
      <Header />
      <div>
        {children}
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

export default MainLayout;
