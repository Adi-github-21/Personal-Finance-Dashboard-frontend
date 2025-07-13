import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import API from '../api.jsx';

const accountTypes = ['Savings', 'Current', 'Checking', 'Other'];
const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'NZD']; // Common currencies

// 'currentAccount' prop add kiya gaya hai edit functionality ke liye
function BankAccountFormModal({ open, handleClose, onAccountSaved, currentAccount }) {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect hook: Jab modal open ho ya currentAccount change ho, form ko pre-fill karein
  useEffect(() => {
    if (currentAccount) {
      // Edit mode: form ko existing data se pre-fill karein
      setBankName(currentAccount.bankName || '');
      setAccountType(currentAccount.accountType || 'Savings');
      setBalance(currentAccount.balance !== undefined ? currentAccount.balance.toString() : '');
      setCurrency(currentAccount.currency || 'INR');
    } else {
      // Add mode: form ko reset karein
      setBankName('');
      setAccountType('Savings');
      setBalance('');
      setCurrency('INR');
    }
    setError(''); // Har baar modal khulne par error clear karein
  }, [open, currentAccount]); // Dependencies: open aur currentAccount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const accountData = {
      bankName,
      accountType,
      balance: parseFloat(balance),
      currency,
    };

    try {
      let res;
      if (currentAccount) {
        // Edit mode: PUT request
        res = await API.put(`/bankaccounts/${currentAccount._id}`, accountData);
      } else {
        // Add mode: POST request
        res = await API.post('/bankaccounts', accountData);
      }
      onAccountSaved(res.data); // Parent component ko updated/new account pass karein
      handleClose(); // Modal band karein
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentAccount ? 'EdiT Bank Account ' : 'Add Bank Account'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            //autoFocus
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
            id="accountType"
            select
            label="Account Type"
            fullWidth
            variant="outlined"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            required
          >
            {accountTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            id="balance"
            label="Current Balance"
            type="number"
            fullWidth
            variant="outlined"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="currency"
            select
            label="Currency"
            fullWidth
            variant="outlined"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            {currencies.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentAccount ? 'Update Karein' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BankAccountFormModal;