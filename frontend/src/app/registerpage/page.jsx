"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthForm from "../../components/AuthForm";


const RegisterPage = () => {
  const router = useRouter();

  const handleRegister = async (formData, setError, setSuccess) => {
    const res = await axios.post("http://localhost:4000/api/auth/register", formData);
    console.log("Register API response:", res.data);

    setSuccess(res.data.message);
    setTimeout(() => router.push("/loginpage"), 2000);
  };

  return <AuthForm title="Create Account" fields={["name", "email", "password"]} submitText="Register" onSubmit={handleRegister} />;
};

export default RegisterPage;
