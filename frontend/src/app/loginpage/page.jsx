"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthForm from "../../components/AuthForm";

const LoginPage = () => {
  const router = useRouter();

  // Function to handle login
  const handleLogin = async (formData, setError, setSuccess) => {
    // Reset messages
    setError("");
    setSuccess("");

    try {
      // Send login request
      const res = await axios.post("http://localhost:4000/api/auth/login", formData);
       // Log the entire response to check token
      console.log("Login API response:", res.data);

      // Check if token is received
      if (!res.data?.data?.token) {
        setError("No token received from server");
        return;
      }

      // Save token and user info to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ token: res.data.data.token, user: res.data.data.user })
      );

      // Show success message
      setSuccess(res.data.message);

      // Redirect to dashboard after 1.5 seconds
     // setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.message || "Something went wrong");
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
