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
  CircularProgress,
  Typography
} from '@mui/material';
import API from '../api.jsx'; // Assuming this is your axios instance or similar

const accountTypes = ['Savings', 'Current', 'Checking', 'Other'];
const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'NZD'];

function BankAccountFormModal({ open, handleClose, onAccountSaved, currentAccount }) {
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [selectedFile, setSelectedFile] = useState(null); // State to hold the selected File object
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(''); // For displaying the selected image or existing URL
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (currentAccount) {
        setBankName(currentAccount.bankName || '');
        setAccountType(currentAccount.accountType || 'Savings');
        setBalance(currentAccount.balance !== undefined ? currentAccount.balance.toString() : '');
        setCurrency(currentAccount.currency || 'INR');
        setProfilePhotoPreview(currentAccount.profilePhotoUrl || ''); // Set existing photo URL for preview
        setSelectedFile(null); // Clear selected file when opening for edit
      } else {
        setBankName('');
        setAccountType('Savings');
        setBalance('');
        setCurrency('INR');
        setProfilePhotoPreview(''); // Reset for new account
        setSelectedFile(null); // Reset for new account
      }
      setError('');
    }
  }, [open, currentAccount]);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setProfilePhotoPreview(URL.createObjectURL(file)); // Create a temporary URL for preview
    } else {
      setProfilePhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('bankName', bankName);
    formData.append('accountType', accountType);
    formData.append('balance', parseFloat(balance)); // Convert to number for backend
    formData.append('currency', currency);
    if (selectedFile) {
      formData.append('profilePhoto', selectedFile); // Append the actual file
    } else if (currentAccount && currentAccount.profilePhotoUrl && !selectedFile) {
      // If no new file selected but there was an existing one, send it back as a URL string
      // This is important if the backend expects a URL string when no new file is uploaded
      formData.append('profilePhotoUrl', currentAccount.profilePhotoUrl);
    } else {
      // If no file and no existing URL, send an empty string or null
      formData.append('profilePhotoUrl', '');
    }


    try {
      let res;
      if (currentAccount) {
        // For PUT, we send FormData. Backend will handle if file is updated or not.
        res = await API.put(`/bankaccounts/${currentAccount._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
      } else {
        res = await API.post('/bankaccounts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
      }
      onAccountSaved(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2, px: 3 }}>
        {currentAccount ? 'Edit Bank Account' : 'Add Bank Account'}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="dense"
            id="bankName"
            label="Bank Name"
            type="text"
            fullWidth
            variant="outlined"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
          >
            {currencies.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* File input for profile photo */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Upload Profile Photo (Optional)
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: '16px', display: 'block' }}
          />
          {profilePhotoPreview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={profilePhotoPreview} alt="Profile Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ccc' }} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>Image Preview</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} color="error" disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (currentAccount ? 'Update Account' : 'Add Account')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BankAccountFormModal;
