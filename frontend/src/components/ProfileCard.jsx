"use client";
import {
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";

export default function ProfileCard({
  profile,
  form,
  setForm,
  saving,
  handleUpdate,
  handleImageUpload,
  handleDeleteImage,
}) {
  return (
    <Box display="flex" justifyContent="center" px={2}>
      <Card
        sx={{
          display: "flex",
          width: "90%",
          maxWidth: 900,
          borderRadius: 4,
          boxShadow: 6,
          fontFamily: '"Roboto Slab", serif',
        }}
      >
        {/* Left Side */}
        <Box flex={1} bgcolor="#5d3b27" color="#fff" p={4}>
          <Box display="flex" alignItems="center" mb={2} position="relative">
            <Avatar
              src={profile.imagePreview || ""}
              sx={{
                bgcolor: "#776343ff",
                color: "#b8860b",
                width: 150,
                height: 150,
                mr: 2,
                fontSize: "5rem",
                fontWeight: 700,
                fontFamily: '"Roboto Slab", serif',
                boxShadow: 3,
              }}
            >
              {!profile.imagePreview && profile.name?.charAt(0).toUpperCase()}
            </Avatar>

            {/* Upload Icon */}
            <IconButton
              component="label"
              sx={{
                position: "absolute",
                bottom: 10,
                left: 110,
                bgcolor: "white",
                "&:hover": { bgcolor: "#eee" },
                boxShadow: 2,
              }}
            >
              <PhotoCameraIcon sx={{ color: "#5d3b27" }} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </IconButton>

            {/* Delete Icon */}
            {profile.imagePreview && (
              <IconButton
                onClick={handleDeleteImage}
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 110,
                  bgcolor: "white",
                  "&:hover": { bgcolor: "#fdd" },
                  boxShadow: 2,
                  width: 28,
                  height: 28,
                }}
              >
                <CloseIcon sx={{ fontSize: 18, color: "brown" }} />
              </IconButton>
            )}

            <Box>
              <Typography variant="h6" fontWeight="bold">
                {profile.name}
              </Typography>
              <Typography variant="body2">{profile.email}</Typography>
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Account Status
            </Typography>
            <Typography>{profile.active ? "Active" : "Inactive"}</Typography>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Member Since
            </Typography>
            <Typography>
              {new Date(profile.createdAt).toLocaleDateString("en-GB")}
            </Typography>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Last Updated
            </Typography>
            <Typography>
              {profile.updatedAt
                ? new Date(profile.updatedAt).toLocaleDateString("en-GB")
                : "—"}
            </Typography>
          </Box>
        </Box>

        {/* Right Side */}
        <Box flex={1.2} bgcolor="#ede3dcff" p={4}>
          <Typography variant="h6" mb={2} fontWeight="bold" color="#5d3b27">
            Profile Details
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            margin="normal"
            InputProps={{ style: { fontFamily: '"Roboto Slab", serif' } }}
          />

          <TextField
            fullWidth
            label="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="normal"
            InputProps={{ style: { fontFamily: '"Roboto Slab", serif' } }}
          />

          {/* Buttons */}
          <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() =>
                setForm({
                  name: profile.name,
                  email: profile.email,
                })
              }
              sx={{ fontFamily: '"Roboto Slab", serif' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={saving}
              sx={{ fontFamily: '"Roboto Slab", serif' }}
            >
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
