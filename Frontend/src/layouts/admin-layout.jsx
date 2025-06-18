import React from "react";
import AdminHeader from "../components/AdminHeader";
import AdminNavSidebar from "../components/AdminNavSidebar";

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
      <AdminHeader />
      <div className="flex">
        <AdminNavSidebar >
        <div className="flex-1 p-6 pt-20">
          {children}
        </div>
        </AdminNavSidebar>

      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default MainLayout;
