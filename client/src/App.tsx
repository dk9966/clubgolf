import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import ClubDetails from "./pages/ClubDetails";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ScoreForm from "./pages/ScoreForm";
import Settings from "./pages/Settings";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2E7D32", // Green color for golf theme
    },
    secondary: {
      main: "#1565C0", // Blue color for accents
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Box sx={{ display: "flex" }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <Box sx={{ width: "100%" }}>
                        <Box
                          sx={{
                            position: "fixed",
                            top: 16,
                            left: 16,
                            zIndex: 1000,
                          }}
                        >
                          <Sidebar />
                        </Box>
                        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/scores/new" element={<ScoreForm />} />
                            <Route
                              path="/scores/:scoreId/edit"
                              element={<ScoreForm />}
                            />
                            <Route
                              path="/clubs/:clubId"
                              element={<ClubDetails />}
                            />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </Box>
                      </Box>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
