import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    console.log("Login success callback triggered, navigating to home...");
    // Navigate immediately since auth user is now fully built before callback
    navigate("/");
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default Login;
