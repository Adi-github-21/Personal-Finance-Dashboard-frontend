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
  Typography,
  CircularProgress
} from '@mui/material';

// Helper function to calculate new tenure after prepayment
const calculateNewTenure = (remainingPrincipal, monthlyRate, proposedEmi) => {
  if (proposedEmi <= remainingPrincipal * monthlyRate) { // If proposed EMI is less than or equal to current interest
    return Infinity; // Loan will never be paid off with this EMI
  }
  const n_new = Math.log(proposedEmi / (proposedEmi - remainingPrincipal * monthlyRate)) / Math.log(1 + monthlyRate);
  return n_new;
};

// Helper function to calculate total interest paid for a loan (simplified)
const calculateTotalInterestPaidForLoan = (principal, emi, tenureMonths) => {
  return (emi * tenureMonths) - principal;
};

function PrepaymentCalculatorModal({ open, handleClose, loan }) {
  const [prepaymentAmount, setPrepaymentAmount] = useState('');
  const [newEmiAmount, setNewEmiAmount] = useState(''); // Optional: if user wants to change EMI
  const [results, setResults] = useState(null); // To store calculation results
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset results and error when modal opens or loan changes
    setResults(null);
    setError('');
    setPrepaymentAmount('');
    setNewEmiAmount('');
  }, [open, loan]);

  const handleCalculate = () => {
    setError('');
    setResults(null);
    setLoading(true);

    if (!loan) {
      setError("Loan details not available.");
      setLoading(false);
      return;
    }

    const currentRemainingPrincipal = loan.remainingAmount;
    const currentEmi = loan.emiAmount;
    const annualRate = loan.interestRate;
    const monthlyRate = annualRate / (12 * 100);

    const extraPayment = parseFloat(prepaymentAmount);
    const proposedEmi = newEmiAmount ? parseFloat(newEmiAmount) : currentEmi; // User can choose to keep EMI same or change

    if (isNaN(extraPayment) || extraPayment < 0 || (newEmiAmount && (isNaN(proposedEmi) || proposedEmi <= 0))) {
      setError("Please enter valid positive numbers for prepayment or new EMI.");
      setLoading(false);
      return;
    }

    // Scenario 1: Prepayment (reduce tenure, keep EMI same)
    let tempRemainingPrincipal = currentRemainingPrincipal - extraPayment;
    if (tempRemainingPrincipal < 0) tempRemainingPrincipal = 0; // Loan paid off by prepayment

    const newTenureMonths = calculateNewTenure(tempRemainingPrincipal, monthlyRate, proposedEmi);

    if (newTenureMonths === Infinity) {
      setError("Proposed EMI is too low to pay off the loan. Please increase EMI or reduce prepayment.");
      setLoading(false);
      return;
    }

    const newTenureYears = newTenureMonths / 12;
    const newProjectedEndDate = new Date(loan.nextDueDate); // Start from next due date for projection
    newProjectedEndDate.setMonth(newProjectedEndDate.getMonth() + Math.ceil(newTenureMonths));

    // Calculate total interest saved
    // This is a simplified calculation. A full amortization schedule would be more accurate.
    const oldTotalInterestRemaining = calculateTotalInterestPaidForLoan(currentRemainingPrincipal, currentEmi, loan.loanTenureMonths); // This is approximate
    const newTotalInterestRemaining = calculateTotalInterestPaidForLoan(tempRemainingPrincipal, proposedEmi, newTenureMonths);

    const totalInterestSaved = oldTotalInterestRemaining - newTotalInterestRemaining;


    setResults({
      newRemainingPrincipal: tempRemainingPrincipal.toFixed(2),
      newTenure: `${Math.floor(newTenureMonths)} months (${(newTenureMonths / 12).toFixed(1)} years)`,
      newProjectedEndDate: newProjectedEndDate.toLocaleDateString(),
      totalInterestSaved: totalInterestSaved.toFixed(2),
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Prepayment Calculator for {loan?.loanName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" gutterBottom>
            Current Remaining: ₹ {loan?.remainingAmount?.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Current EMI: ₹ {loan?.emiAmount?.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Annual Rate: {loan?.interestRate?.toFixed(2)}%
          </Typography>

          <TextField
            margin="dense"
            id="prepaymentAmount"
            label="Extra Amount to Pay"
            type="number"
            fullWidth
            variant="outlined"
            value={prepaymentAmount}
            onChange={(e) => setPrepaymentAmount(e.target.value)}
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="newEmiAmount"
            label="New EMI Amount (Optional, leave empty to keep current EMI)"
            type="number"
            fullWidth
            variant="outlined"
            value={newEmiAmount}
            onChange={(e) => setNewEmiAmount(e.target.value)}
            inputProps={{ step: "0.01" }}
            sx={{ mt: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCalculate}
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Calculate Prepayment'}
          </Button>

          {results && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Results:</Typography>
              <Typography variant="body1">
                New Remaining Principal: ₹ {results.newRemainingPrincipal}
              </Typography>
              <Typography variant="body1">
                New Tenure: {results.newTenure}
              </Typography>
              <Typography variant="body1">
                New Projected End Date: {results.newProjectedEndDate}
              </Typography>
              <Typography variant="body1" sx={{ color: results.totalInterestSaved > 0 ? 'secondary.main' : 'error.main' }}>
                Total Interest Saved: ₹ {results.totalInterestSaved}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PrepaymentCalculatorModal;
