import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // TODO: Implement profile update
    setMessage("Profile updated successfully");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // TODO: Implement password change
    setMessage("Password changed successfully");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <form onSubmit={handleUpdateProfile}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={user?.email}
                disabled
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Update Profile
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={handleChangePassword}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Change Password
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Messages */}
        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}
        {message && (
          <Grid item xs={12}>
            <Typography color="success.main">{message}</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Settings;
