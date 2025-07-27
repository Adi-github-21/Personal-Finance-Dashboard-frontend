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

const debtTypes = ['I Owe', 'Owed To Me'];
const categories = ['Food', 'Travel', 'Rent', 'Utilities', 'Shopping', 'Other'];
const statuses = ['Pending', 'Paid'];

function DebtFormModal({ open, handleClose, onDebtSaved, currentDebt }) {
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('I Owe');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [transactionDate, setTransactionDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending'); // Default status

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentDebt) {
      setPersonName(currentDebt.personName || '');
      setAmount(currentDebt.amount !== undefined ? currentDebt.amount.toString() : '');
      setType(currentDebt.type || 'I Owe');
      setDescription(currentDebt.description || '');
      setCategory(currentDebt.category || 'Other');
      setTransactionDate(currentDebt.transactionDate ? new Date(currentDebt.transactionDate).toISOString().split('T')[0] : '');
      setDueDate(currentDebt.dueDate ? new Date(currentDebt.dueDate).toISOString().split('T')[0] : '');
      setStatus(currentDebt.status || 'Pending');
    } else {
      setPersonName('');
      setAmount('');
      setType('I Owe');
      setDescription('');
      setCategory('Other');
      setTransactionDate(new Date().toISOString().split('T')[0]); // Default to today
      setDueDate('');
      setStatus('Pending');
    }
    setError('');
  }, [open, currentDebt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const debtData = {
      personName,
      amount: parseFloat(amount),
      type,
      description,
      category,
      transactionDate,
      dueDate: dueDate || undefined,
      status,
    };

    try {
      let res;
      if (currentDebt) {
        res = await API.put(`/debts/${currentDebt._id}`, debtData);
      } else {
        res = await API.post('/debts', debtData);
      }
      onDebtSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentDebt ? 'Debt Entry Edit Karein' : 'Naya Debt Add Karein'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="personName"
            label="Vyakti Ka Naam"
            type="text"
            fullWidth
            variant="outlined"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
          <TextField
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
            <InputLabel id="debt-type-label">Debt Type</InputLabel>
            <Select
              labelId="debt-type-label"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Debt Type"
            >
              {debtTypes.map((option) => (
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
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="transactionDate"
            label="Transaction Date"
            type="date"
            fullWidth
            variant="outlined"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            id="dueDate"
            label="Due Date (Optional)"
            type="date"
            fullWidth
            variant="outlined"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {currentDebt && ( // Status sirf edit mode mein dikhao
            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                {statuses.map((option) => (
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
          Cancel Karein
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentDebt ? 'Update Karein' : 'Add Karein')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DebtFormModal;
