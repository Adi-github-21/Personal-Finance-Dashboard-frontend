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

const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Transport', 'Health', 'Education', 'Other'];
const expenseSources = ['Manual', 'Automated']; // Manual is default for now

function ExpenseFormModal({ open, handleClose, onExpenseSaved, currentExpense }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [source, setSource] = useState('Manual'); // Default to Manual

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentExpense) {
      setAmount(currentExpense.amount !== undefined ? currentExpense.amount.toString() : '');
      setCategory(currentExpense.category || 'Other');
      setDescription(currentExpense.description || '');
      setTransactionDate(currentExpense.transactionDate ? new Date(currentExpense.transactionDate).toISOString().slice(0, 16) : '');
      setSource(currentExpense.source || 'Manual');
    } else {
      setAmount('');
      setCategory('Other');
      setDescription('');
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
      setTransactionDate(now.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:MM format
      setSource('Manual');
    }
    setError('');
  }, [open, currentExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const expenseData = {
      amount: parseFloat(amount),
      category,
      description,
      transactionDate: new Date(transactionDate),
      source,
    };

    try {
      let res;
      if (currentExpense) {
        res = await API.put(`/expenses/${currentExpense._id}`, expenseData);
      } else {
        res = await API.post('/expenses', expenseData);
      }
      onExpenseSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
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
              {expenseCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="transactionDate"
            label="Transaction Date and Time"
            type="datetimme-local"
            fullWidth
            variant="outlined"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
          {currentExpense && ( // Source field sirf edit mode mein dikhao
            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="source-label">Source</InputLabel>
              <Select
                labelId="source-label"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label="Source"
              >
                {expenseSources.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentExpense ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExpenseFormModal;
