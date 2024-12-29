import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { clubs, scores } from "../services/api";

interface Club {
  _id: string;
  name: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ScoreForm: React.FC = () => {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(scoreId);

  const [numHoles, setNumHoles] = useState<number>(18);
  const [holeScores, setHoleScores] = useState<number[]>(Array(18).fill(0));
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Fetch clubs for dropdown
  const { data: clubsData } = useQuery<Club[]>("clubs", () =>
    clubs.getAll().then((res) => res.data)
  );

  // Fetch existing score if editing
  const { data: scoreData } = useQuery(
    ["score", scoreId],
    () => scores.getOne(scoreId!).then((res) => res.data),
    {
      enabled: isEditing,
    }
  );

  // Load existing score data
  useEffect(() => {
    if (scoreData) {
      setHoleScores(scoreData.holeScores);
      setNumHoles(scoreData.holesPlayed);
      setSelectedClub(scoreData.club?._id || "");
      setNotes(scoreData.notes || "");
    }
  }, [scoreData]);

  // Create score mutation
  const createScore = useMutation(
    (data: { holeScores: number[]; club?: string; notes?: string }) =>
      scores.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recentScores");
        navigate("/");
      },
      onError: (error: ApiError) => {
        setError(error.response?.data?.message || "Error saving score");
      },
    }
  );

  // Update score mutation
  const updateScore = useMutation(
    (data: { holeScores: number[]; notes?: string }) =>
      scores.update(scoreId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recentScores");
        queryClient.invalidateQueries(["score", scoreId]);
        navigate("/");
      },
      onError: (error: ApiError) => {
        setError(error.response?.data?.message || "Error updating score");
      },
    }
  );

  const handleHoleScoreChange = (index: number, value: string) => {
    const newScore = parseInt(value) || 0;
    const newHoleScores = [...holeScores];
    newHoleScores[index] = newScore;
    setHoleScores(newHoleScores);
  };

  const handleNumHolesChange = (event: SelectChangeEvent) => {
    const newNumHoles = parseInt(event.target.value);
    setNumHoles(newNumHoles);

    // Adjust hole scores array
    if (newNumHoles > holeScores.length) {
      // Add new holes with 0 scores
      setHoleScores([
        ...holeScores,
        ...Array(newNumHoles - holeScores.length).fill(0),
      ]);
    } else {
      // Remove excess holes
      setHoleScores(holeScores.slice(0, newNumHoles));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const data = {
      holeScores: holeScores.slice(0, numHoles),
      ...(selectedClub && { club: selectedClub }),
      ...(notes && { notes }),
    };

    if (isEditing) {
      updateScore.mutate(data);
    } else {
      createScore.mutate(data);
    }
  };

  const totalScore = holeScores
    .slice(0, numHoles)
    .reduce((sum, score) => sum + score, 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? "Edit Score" : "Add New Score"}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Number of holes selector */}
            {!isEditing && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Number of Holes</InputLabel>
                  <Select
                    value={numHoles.toString()}
                    onChange={handleNumHolesChange}
                    label="Number of Holes"
                  >
                    <MenuItem value="9">9 Holes</MenuItem>
                    <MenuItem value="18">18 Holes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Hole scores */}
            {holeScores.slice(0, numHoles).map((score, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <TextField
                  fullWidth
                  label={`Hole ${index + 1}`}
                  type="number"
                  value={score}
                  onChange={(e) => handleHoleScoreChange(index, e.target.value)}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
            ))}

            {/* Total score */}
            <Grid item xs={12}>
              <Typography variant="h6" align="right">
                Total Score: {totalScore}
              </Typography>
            </Grid>

            {/* Club selection (only for new scores) */}
            {!isEditing && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Club</InputLabel>
                  <Select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    label="Club"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {clubsData?.map((club) => (
                      <MenuItem key={club._id} value={club._id}>
                        {club.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>

            {/* Submit button */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={createScore.isLoading || updateScore.isLoading}
                >
                  {isEditing ? "Update Score" : "Save Score"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ScoreForm;
