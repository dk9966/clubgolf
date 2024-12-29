import { Add as AddIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { clubs, scores } from "../services/api";

interface Score {
  _id: string;
  date: string;
  totalScore: number;
  club?: {
    _id: string;
    name: string;
  };
}

interface Club {
  _id: string;
  name: string;
  members: { _id: string; name: string }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: recentScores, isLoading: loadingScores } = useQuery<Score[]>(
    "recentScores",
    () => scores.getAll().then((res) => res.data)
  );

  const { data: userClubs, isLoading: loadingClubs } = useQuery<Club[]>(
    "userClubs",
    () => clubs.getAll().then((res) => res.data)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.name}!
            </Typography>
            <Button
              component={RouterLink}
              to="/scores/new"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
              Add New Score
            </Button>
          </Box>
        </Grid>

        {/* Recent Scores */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" component="h2">
                Recent Scores
              </Typography>
            </Box>
            {loadingScores ? (
              <Typography>Loading scores...</Typography>
            ) : (
              <List>
                {recentScores?.map((score, index) => (
                  <React.Fragment key={score._id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      component={RouterLink}
                      to={`/scores/${score._id}/edit`}
                      sx={{ textDecoration: "none", color: "inherit" }}
                    >
                      <ListItemText
                        primary={`Score: ${score.totalScore}`}
                        secondary={`${new Date(
                          score.date
                        ).toLocaleDateString()} ${
                          score.club ? `at ${score.club.name}` : ""
                        }`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
                {recentScores?.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2 }}>
                    No scores recorded yet
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Clubs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" component="h2">
                Your Clubs
              </Typography>
              <Button
                component={RouterLink}
                to="/clubs/new"
                variant="outlined"
                startIcon={<AddIcon />}
              >
                Create Club
              </Button>
            </Box>
            {loadingClubs ? (
              <Typography>Loading clubs...</Typography>
            ) : (
              <List>
                {userClubs?.map((club, index) => (
                  <React.Fragment key={club._id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      component={RouterLink}
                      to={`/clubs/${club._id}`}
                      sx={{ textDecoration: "none", color: "inherit" }}
                    >
                      <ListItemText
                        primary={club.name}
                        secondary={`${club.members.length} members`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
                {userClubs?.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2 }}>
                    No clubs joined yet
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
