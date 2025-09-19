"use client";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import Authentication from "../../components/Authentication";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const RegisterPage = () => {
  const router = useRouter();
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait until client mounts AND i18next is ready
  if (!mounted || !ready) return null;

  const handleRegister = async (formData, setError, setSuccess) => {
    setError("");
    setSuccess("");

    // Validate fields before sending
    if (!formData.name || !formData.email || !formData.password) {
      setError(t("allFieldsRequired"));
      return;
    }

    try {
      const res = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess(res.data?.message || t("registeredSuccessfully"));

      // Go to login page after 2s
      setTimeout(() => router.push("/loginpage"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || t("somethingWentWrong"));
    }
  };

  return (
    <Authentication
      title={t("createAccount")}
      fields={["name", "email", "password"]}
      submitText={t("register")}
      onSubmit={handleRegister}
    />
  );
};

export default RegisterPage;
