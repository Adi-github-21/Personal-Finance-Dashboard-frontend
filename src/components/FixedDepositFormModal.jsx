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
  Select
} from '@mui/material';
import API from '../api.jsx';

const compoundingFrequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annually', 'At Maturity', 'Other'];
const interestPayouts = ['Cumulative', 'Periodic'];

function FixedDepositFormModal({ open, handleClose, onFixedDepositSaved, currentFixedDeposit }) {
  const [bankName, setBankName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [tenure, setTenure] = useState(''); // Tenure in months
  const [fdAccountNumber, setFdAccountNumber] = useState('');
  const [compoundingFrequency, setCompoundingFrequency] = useState('Annually');
  const [interestPayout, setInterestPayout] = useState('Cumulative');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentFixedDeposit) {
      setBankName(currentFixedDeposit.bankName || '');
      setPrincipalAmount(currentFixedDeposit.principalAmount !== undefined ? currentFixedDeposit.principalAmount.toString() : '');
      setInterestRate(currentFixedDeposit.interestRate !== undefined ? currentFixedDeposit.interestRate.toString() : '');
      setStartDate(currentFixedDeposit.startDate ? new Date(currentFixedDeposit.startDate).toISOString().split('T')[0] : '');
      setTenure(currentFixedDeposit.tenure !== undefined ? currentFixedDeposit.tenure.toString() : '');
      setFdAccountNumber(currentFixedDeposit.fdAccountNumber || '');
      setCompoundingFrequency(currentFixedDeposit.compoundingFrequency || 'Annually');
      setInterestPayout(currentFixedDeposit.interestPayout || 'Cumulative');
    } else {
      setBankName('');
      setPrincipalAmount('');
      setInterestRate('');
      setStartDate('');
      setTenure('');
      setFdAccountNumber('');
      setCompoundingFrequency('Annually');
      setInterestPayout('Cumulative');
    }
    setError('');
  }, [open, currentFixedDeposit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fdData = {
      bankName,
      principalAmount: parseFloat(principalAmount),
      interestRate: parseFloat(interestRate),
      startDate,
      tenure: parseInt(tenure, 10), // Tenure ko integer mein convert karein
      fdAccountNumber,
      compoundingFrequency,
      interestPayout,
    };

    try {
      let res;
      if (currentFixedDeposit) {
        res = await API.put(`/fixeddeposits/${currentFixedDeposit._id}`, fdData);
      } else {
        res = await API.post('/fixeddeposits', fdData);
      }
      onFixedDepositSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentFixedDeposit ? 'Edit Fixed Deposit' : 'Add New Fixed Deposit'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="bankName"
            label="Bank Name"
            type="text"
            fullWidth
            variant="outlined"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="principalAmount"
            label="Principal Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="interestRate"
            label="Interest Rate (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="startDate"
            label="Start Date (Booking Date)"
            type="date"
            fullWidth
            variant="outlined"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            id="tenure"
            label="Tenure (in Months)"
            type="number"
            fullWidth
            variant="outlined"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            required
            inputProps={{ step: "1" }}
          />
          <TextField
            margin="dense"
            id="fdAccountNumber"
            label="FD Account Number (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={fdAccountNumber}
            onChange={(e) => setFdAccountNumber(e.target.value)}
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="compounding-frequency-label">Compounding Frequency</InputLabel>
            <Select
              labelId="compounding-frequency-label"
              id="compoundingFrequency"
              value={compoundingFrequency}
              onChange={(e) => setCompoundingFrequency(e.target.value)}
              label="Compounding Frequency"
            >
              {compoundingFrequencies.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="interest-payout-label">Interest Payout</InputLabel>
            <Select
              labelId="interest-payout-label"
              id="interestPayout"
              value={interestPayout}
              onChange={(e) => setInterestPayout(e.target.value)}
              label="Interest Payout"
            >
              {interestPayouts.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentFixedDeposit ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FixedDepositFormModal;