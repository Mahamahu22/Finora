"use client";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import Authentication from "../../components/Authentication";

const RegisterPage = () => {
  const router = useRouter();

  const handleRegister = async (formData, setError, setSuccess) => {
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/register", formData);

      setSuccess(res.data?.message || "Registered successfully");

      // Go to login page after 2s
      setTimeout(() => router.push("/loginpage"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Authentication
      title="Create Account"
      fields={["name", "email", "password"]}
      submitText="Register"
      onSubmit={handleRegister}
    />
  );
};

export default RegisterPage;
