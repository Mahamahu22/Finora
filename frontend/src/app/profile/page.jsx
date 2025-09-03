"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Box, Typography, CircularProgress } from "@mui/material";
import { saveItem, getItem, removeItem } from "@/utils/storage";
import ProfileCard from "@/components/ProfileCard"; // Import reusable component

const tips = [
  "Review your monthly budget at the start of each month.",
  "Track every expense immediately after spending.",
  "Categorize expenses consistently for accurate reports.",
  "Save receipts for all purchases to avoid missing entries.",
  "Set spending limits for each category to avoid overspending.",
  "Track recurring subscriptions to prevent unexpected charges.",
  "Review your high expenses weekly to identify unnecessary spending.",
  "Allocate a portion of income for savings before spending.",
  "Compare monthly expenses to previous months to spot trends.",
  "Plan for seasonal or annual expenses in advance.",
  "Track cash and digital payments separately for clarity.",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tip, setTip] = useState("");
  const [imageKey, setImageKey] = useState("");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        const data = res.data.data;

        const key = `profileImage_${data.email}`;
        setImageKey(key);

        const savedImage = getItem(key);

        setProfile({
          ...data,
          imagePreview: savedImage || "",
        });

        setForm({ name: data.name || "", email: data.email || "" });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // Save profile updates
  const handleUpdate = async () => {
    try {
      setSaving(true);
      const payload = { name: form.name, email: form.email };
      const res = await api.put("/user/profile", payload);
      setProfile((prev) => ({ ...prev, ...res.data.data }));
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Image upload
  const handleImageUpload = (file) => {
    if (!imageKey) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => {
        const updated = { ...prev, imagePreview: reader.result };
        saveItem(imageKey, reader.result);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  // Delete image
  const handleDeleteImage = () => {
    if (!imageKey) return;
    setProfile((prev) => ({ ...prev, imagePreview: "" }));
    removeItem(imageKey);
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );

  if (!profile) return <p>No profile found</p>;

  return (
    <Box
      minHeight="100vh"
      sx={{ background: "linear-gradient(to right, #f7d5a9ff, #bb863aff)" }}
      fontFamily='"Roboto Slab", serif'
    >
      {/* Welcome Message */}
      <Box p={3}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#5d3b27" }}>
          Welcome, {profile.name} 👋
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#8b5e3c", fontStyle: "italic" }}>
          💡 {tip}
        </Typography>
      </Box>

      {/* ✅ Reusable Profile Card */}
      <ProfileCard
        profile={profile}
        form={form}
        setForm={setForm}
        saving={saving}
        handleUpdate={handleUpdate}
        handleImageUpload={handleImageUpload}
        handleDeleteImage={handleDeleteImage}
      />
    </Box>
  );
}
