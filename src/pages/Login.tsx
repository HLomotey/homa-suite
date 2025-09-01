import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default Login;
