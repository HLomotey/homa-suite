import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    console.log("Login success callback triggered, navigating to home...");
    // Add small delay to ensure auth state has propagated
    setTimeout(() => {
      navigate("/");
    }, 50);
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default Login;
