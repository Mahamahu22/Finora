"use client";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { saveUser } from "../../utils/storage";
import AuthForm from "../../components/AuthCard";

const LoginPage = () => {
  const router = useRouter();

  const handleLogin = async (formData, setError, setSuccess) => {
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/login", formData);

      // Make sure token exists
      const token = res?.data?.data?.token;
      const user = res?.data?.data?.user;

      if (!token) {
        setError("No token received from server");
        return;
      }

      // Save token + user to localStorage via helper
      saveUser({ token, user });

      setSuccess(res.data?.message || "Login successful");

      // Redirect after a short delay (optional)
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <AuthForm
      title="Login"
      fields={["email", "password"]}
      submitText="Login"
      onSubmit={handleLogin}
    />
  );
};

export default LoginPage;
