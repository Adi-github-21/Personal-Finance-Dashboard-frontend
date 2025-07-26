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
  Typography
} from '@mui/material';
import API from '../api.jsx';

const loanTypes = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Other'];

// Helper function to calculate EMI (Frontend side for display)
const calculateEmiFrontend = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return principal / tenureMonths;

  const monthlyRate = annualRate / (12 * 100);
  const n = tenureMonths;
  const emi = principal * monthlyRate * Math.pow((1 + monthlyRate), n) / (Math.pow((1 + monthlyRate), n) - 1);
  return isNaN(emi) ? 0 : emi;
};

function EmiFormModal({ open, handleClose, onLoanSaved, currentLoan }) {
  const [loanName, setLoanName] = useState('');
  const [loanType, setLoanType] = useState('Personal Loan');
  const [totalLoanAmount, setTotalLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenureMonths, setLoanTenureMonths] = useState('');
  const [emiAmount, setEmiAmount] = useState(''); // User can provide or it will be calculated
  const [startDate, setStartDate] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [totalInterestPaid, setTotalInterestPaid] = useState('');

  const [calculatedEmi, setCalculatedEmi] = useState(0); // For displaying calculated EMI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentLoan) {
      setLoanName(currentLoan.loanName || '');
      setLoanType(currentLoan.loanType || 'Personal Loan');
      setTotalLoanAmount(currentLoan.totalLoanAmount !== undefined ? currentLoan.totalLoanAmount.toString() : '');
      setInterestRate(currentLoan.interestRate !== undefined ? currentLoan.interestRate.toString() : '');
      setLoanTenureMonths(currentLoan.loanTenureMonths !== undefined ? currentLoan.loanTenureMonths.toString() : '');
      setEmiAmount(currentLoan.emiAmount !== undefined ? currentLoan.emiAmount.toString() : '');
      setStartDate(currentLoan.startDate ? new Date(currentLoan.startDate).toISOString().split('T')[0] : '');
      setNextDueDate(currentLoan.nextDueDate ? new Date(currentLoan.nextDueDate).toISOString().split('T')[0] : '');
      setRemainingAmount(currentLoan.remainingAmount !== undefined ? currentLoan.remainingAmount.toString() : '');
      setTotalInterestPaid(currentLoan.totalInterestPaid !== undefined ? currentLoan.totalInterestPaid.toString() : '');
    } else {
      setLoanName('');
      setLoanType('Personal Loan');
      setTotalLoanAmount('');
      setInterestRate('');
      setLoanTenureMonths('');
      setEmiAmount('');
      setStartDate('');
      setNextDueDate('');
      setRemainingAmount('');
      setTotalInterestPaid('');
    }
    setError('');
  }, [open, currentLoan]);

  // Calculate EMI on the fly for display
  useEffect(() => {
    const principal = parseFloat(totalLoanAmount);
    const rate = parseFloat(interestRate);
    const tenure = parseInt(loanTenureMonths, 10);

    if (principal > 0 && rate >= 0 && tenure > 0) {
      const emi = calculateEmiFrontend(principal, rate, tenure);
      setCalculatedEmi(emi.toFixed(2));
    } else {
      setCalculatedEmi(0);
    }
  }, [totalLoanAmount, interestRate, loanTenureMonths]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loanData = {
      loanName,
      loanType,
      totalLoanAmount: parseFloat(totalLoanAmount),
      interestRate: parseFloat(interestRate),
      loanTenureMonths: parseInt(loanTenureMonths, 10),
      emiAmount: emiAmount ? parseFloat(emiAmount) : calculatedEmi, // Agar user ne EMI nahi di toh calculated EMI use karein
      startDate,
      nextDueDate,
      remainingAmount: remainingAmount ? parseFloat(remainingAmount) : parseFloat(totalLoanAmount), // Agar remaining amount nahi di toh total amount
      totalInterestPaid: totalInterestPaid ? parseFloat(totalInterestPaid) : 0,
    };

    try {
      let res;
      if (currentLoan) {
        res = await API.put(`/loans/${currentLoan._id}`, loanData);
      } else {
        res = await API.post('/loans', loanData);
      }
      onLoanSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentLoan ? 'Edit Loan Details' : 'Add new Laon'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="loanName"
            label="Loan Name"
            type="text"
            fullWidth
            variant="outlined"
            value={loanName}
            onChange={(e) => setLoanName(e.target.value)}
            required
          />
          <FormControl fullWidth margin="dense" variant="outlined" required>
            <InputLabel id="loan-type-label">Loan Type</InputLabel>
            <Select
              labelId="loan-type-label"
              id="loanType"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              label="Loan Type"
            >
              {loanTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="totalLoanAmount"
            label="Total Loan Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={totalLoanAmount}
            onChange={(e) => setTotalLoanAmount(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="interestRate"
            label="Annual Interest Rate (%)"
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
            id="loanTenureMonths"
            label="Loan Tenure (in Months)"
            type="number"
            fullWidth
            variant="outlined"
            value={loanTenureMonths}
            onChange={(e) => setLoanTenureMonths(e.target.value)}
            required
            inputProps={{ step: "1" }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Calculated EMI: ₹ {calculatedEmi} (If you dont give EMI amount then will be used)
          </Typography>
          <TextField
            margin="dense"
            id="emiAmount"
            label="EMI Amount (Optional - will auto-calculate if empty)"
            type="number"
            fullWidth
            variant="outlined"
            value={emiAmount}
            onChange={(e) => setEmiAmount(e.target.value)}
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="startDate"
            label="Loan Start Date"
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
            id="nextDueDate"
            label="Next Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
          {/* Remaining Amount and Total Interest Paid can be updated via a separate "Pay EMI" action later */}
          {currentLoan && (
            <>
              <TextField
                margin="dense"
                id="remainingAmount"
                label="Remaining Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={remainingAmount}
                onChange={(e) => setRemainingAmount(e.target.value)}
                required
                inputProps={{ step: "0.01" }}
              />
              <TextField
                margin="dense"
                id="totalInterestPaid"
                label="Total Interest Paid So Far"
                type="number"
                fullWidth
                variant="outlined"
                value={totalInterestPaid}
                onChange={(e) => setTotalInterestPaid(e.target.value)}
                required
                inputProps={{ step: "0.01" }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentLoan ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmiFormModal;
