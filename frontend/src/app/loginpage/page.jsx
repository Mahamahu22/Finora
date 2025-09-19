"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { saveUser } from "../../utils/storage";
import AuthForm from "../../components/Authentication";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const router = useRouter();
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait until mounted AND translations are ready
  if (!mounted || !ready) return null;

  const handleLogin = async (formData, setError, setSuccess) => {
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/login", formData);

      const token = res?.data?.data?.token;
      const user = res?.data?.data?.user;

      if (!token) {
        setError(t("noTokenReceived"));
        return;
      }

      saveUser({ token, user });

      setSuccess(res.data?.message || t("loginSuccess"));

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || t("somethingWentWrong"));
    }
  };

  return (
    <AuthForm
      title={t("login")}
      fields={["email", "password"]} // Translate field labels as well
      submitText={t("login")}
      onSubmit={handleLogin}
    />
  );
};

export default LoginPage;
