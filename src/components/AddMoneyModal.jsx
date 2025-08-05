import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import API from '../api.jsx';

function AddMoneyModal({ open, handleClose, onMoneyAdded, goalName, goalId, currentSaved, targetAmount }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amountToAdd = parseFloat(amount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      setError('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post(`/savinggoals/${goalId}/add-money`, { amount: amountToAdd });
      onMoneyAdded(res.data);
      handleClose();
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Money add karne mein dikkat hui.');
    } finally {
      setLoading(false);
    }
  };

  const progress = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
  const newProgress = targetAmount > 0 ? ((currentSaved + parseFloat(amount || 0)) / targetAmount) * 100 : progress;

   return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Money to "{goalName}"</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Current Saved: ₹{(currentSaved ?? 0).toLocaleString('en-IN')} / ₹{(targetAmount ?? 0).toLocaleString('en-IN')}
        </Typography>
        <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{
            height: 8,
            bgcolor: 'primary.main',
            width: `${Math.min(progress, 100)}%`,
            transition: 'width 0.3s'
          }} />
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Adding this amount will make your progress:
        </Typography>
        <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, overflow: 'hidden', mt: 1 }}>
          <Box sx={{
            height: 8,
            bgcolor: 'secondary.main',
            width: `${Math.min(newProgress, 100)}%`,
            transition: 'width 0.3s'
          }} />
        </Box>
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', display: 'block' }}>
          New Progress: {Math.min(newProgress, 100).toFixed(0)}%
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          id="amount"
          label="Add Amount"
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          inputProps={{ step: "0.01" }}
          sx={{ mt: 3 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel Karein
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Add Karein'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMoneyModal;
