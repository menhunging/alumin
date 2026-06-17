import { useForm } from "react-hook-form";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { api } from "@/api/axios";
import { useAuthStore } from "@/store/auth.store";

import "./Login.scss";

type LoginFormValues = {
  login: string;
  password: string;
};

const Login = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);

    try {
      const response = await api.post("/auth/login", data);
      const user = response.data?.user as
        | {
            id: number;
            login: string;
            clubsIDs: number[];
            managerClubIDs: number[];
          }
        | undefined;

      if (user) {
        setAuth(user);
        navigate("/", { replace: true });
      }

      console.log("Успешная авторизация:", response.data);
    } catch (error) {
      const requestError = error as AxiosError<{ message?: string }>;
      const backendMessage = requestError.response?.data?.message;
      setErrorMessage(backendMessage || "Ошибка авторизации");
      console.error(
        "Ошибка авторизации:",
        requestError.response?.data ?? requestError.message,
      );
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      <h1>Авторизация</h1>

      <Input
        type="text"
        placeholder="Логин"
        {...register("login", { required: true })}
      />

      <Input
        type="password"
        placeholder="Пароль"
        {...register("password", { required: true })}
      />

      {errorMessage && <p className="login-form__error">{errorMessage}</p>}

      <Button type="submit">Вход</Button>
    </form>
  );
};

export default Login;
