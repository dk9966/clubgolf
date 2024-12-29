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
  TextField,
  Typography,
} from "@mui/material";
import { TextFieldProps } from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { clubs } from "../services/api";

interface ClubMember {
  _id: string;
  name: string;
  email: string;
}

interface ClubDetails {
  _id: string;
  name: string;
  description?: string;
  manager: ClubMember;
  members: ClubMember[];
}

interface ClubStats {
  averageScore: number;
  lowestScore: number;
  highestScore: number;
  totalRounds: number;
}

const ClubDetails: React.FC = () => {
  const { clubId } = useParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch club details
  const { data: club, isLoading: loadingClub } = useQuery<ClubDetails>(
    ["club", clubId],
    () => clubs.getOne(clubId!).then((res) => res.data)
  );

  // Fetch club statistics
  const { data: stats, isLoading: loadingStats } = useQuery<ClubStats>(
    ["clubStats", clubId, selectedDate],
    () =>
      clubs
        .getStats(clubId!, selectedDate?.toISOString().split("T")[0])
        .then((res) => res.data),
    {
      enabled: Boolean(clubId),
    }
  );

  const isManager = club?.manager._id === user?.id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loadingClub ? (
        <Typography>Loading club details...</Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Club Info */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {club?.name}
              </Typography>
              {club?.description && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {club.description}
                </Typography>
              )}
              <Typography variant="subtitle1">
                Manager: {club?.manager.name}
              </Typography>
            </Paper>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue: Date | null) =>
                    setSelectedDate(newValue)
                  }
                  slots={{
                    textField: (params: TextFieldProps) => (
                      <TextField {...params} fullWidth sx={{ mb: 3 }} />
                    ),
                  }}
                />
              </LocalizationProvider>

              {loadingStats ? (
                <Typography>Loading statistics...</Typography>
              ) : (
                <Box>
                  <Typography>
                    Average Score: {stats?.averageScore.toFixed(1) || "N/A"}
                  </Typography>
                  <Typography>
                    Lowest Score: {stats?.lowestScore || "N/A"}
                  </Typography>
                  <Typography>
                    Highest Score: {stats?.highestScore || "N/A"}
                  </Typography>
                  <Typography>
                    Total Rounds: {stats?.totalRounds || 0}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Members List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Members</Typography>
                {isManager && (
                  <Button variant="outlined" color="primary">
                    Manage Members
                  </Button>
                )}
              </Box>
              <List>
                {club?.members.map((member, index) => (
                  <React.Fragment key={member._id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={member.name}
                        secondary={member.email}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ClubDetails;
