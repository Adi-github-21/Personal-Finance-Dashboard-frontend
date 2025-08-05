import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import API from '../api.jsx';

const goalCategories = ['Travel', 'Gadget', 'Emergency Fund', 'Education', 'Car', 'Home', 'Other'];

function SavingGoalFormModal({ open, handleClose, onGoalSaved, currentGoal }) {
  const [goalName, setGoalName] = useState('');
  const [category, setCategory] = useState('Other');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentGoal) {
      setGoalName(currentGoal.goalName || '');
      setCategory(currentGoal.category || 'Other');
      setTargetAmount(currentGoal.targetAmount !== undefined ? currentGoal.targetAmount.toString() : '');
      setCurrentSaved(currentGoal.currentSaved !== undefined ? currentGoal.currentSaved.toString() : '');
      setDeadline(currentGoal.deadline ? new Date(currentGoal.deadline).toISOString().split('T')[0] : '');
    } else {
      setGoalName('');
      setCategory('Other');
      setTargetAmount('');
      setCurrentSaved('0');
      setDeadline('');
    }
    setError('');
  }, [open, currentGoal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const goalData = {
      goalName,
      category,
      targetAmount: parseFloat(targetAmount),
      currentSaved: parseFloat(currentSaved || 0),
      deadline,
    };

    try {
      let res;
      if (currentGoal) {
        res = await API.put(`/savinggoals/${currentGoal._id}`, goalData);
      } else {
        res = await API.post('/savinggoals', goalData);
      }
      onGoalSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentGoal ? 'Edit Saving Goal' : 'Add Saving Goal'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="goalName"
            label="Goal Name"
            type="text"
            fullWidth
            variant="outlined"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {goalCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="targetAmount"
            label="Target Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="currentSaved"
            label="Current Saved"
            type="number"
            fullWidth
            variant="outlined"
            value={currentSaved}
            onChange={(e) => setCurrentSaved(e.target.value)}
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="deadline"
            label="Deadline"
            type="date"
            fullWidth
            variant="outlined"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentGoal ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SavingGoalFormModal;
