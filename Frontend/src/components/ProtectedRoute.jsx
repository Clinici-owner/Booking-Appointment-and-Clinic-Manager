import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userStr = sessionStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (!allowedRoles || !allowedRoles.includes(user.role)) {
      toast.error("Bạn không có quyền truy cập trang này");
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }
    // eslint-disable-next-line
  }, [user, allowedRoles, navigate]);

  if (!user || !allowedRoles || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute; 