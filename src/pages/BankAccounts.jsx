import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // For default profile photo/icon

import BankAccountFormModal from '../components/BankAccountFormModal.jsx'; // Your separate modal component
import API from '../api.jsx'; // Your API instance
import './BankAccounts.css'; // Import the new CSS file

// Custom confirmation dialog component (replaces window.confirm for better UI)
const CustomConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};


function BankAccounts() {
  const [openModal, setOpenModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAccountToEdit, setCurrentAccountToEdit] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const fetchBankAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/bankaccounts');
      setBankAccounts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Problem in fetching Bank Account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentAccountToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (account) => {
    setCurrentAccountToEdit(account);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentAccountToEdit(null);
  };

  const handleAccountSaved = (savedAccount) => {
    if (currentAccountToEdit) {
      setBankAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account._id === savedAccount._id ? savedAccount : account
        )
      );
    } else {
      setBankAccounts((prevAccounts) => [...prevAccounts, savedAccount]);
    }
  };

  const confirmDelete = (id) => {
    setAccountToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteBankAccount = async () => {
    if (!accountToDelete) return;

    try {
      await API.delete(`/bankaccounts/${accountToDelete}`);
      setBankAccounts((prevAccounts) => prevAccounts.filter((account) => account._id !== accountToDelete));
      setOpenConfirmDialog(false);
      setAccountToDelete(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Problem in Deleting Bank account.');
      setOpenConfirmDialog(false);
      setAccountToDelete(null);
    }
  };

  // // Define your backend base URL (adjust if your backend runs on a different port or domain)
   const BACKEND_BASE_URL = 'http://localhost:5000'; 

  return (
    <div className="bank-accounts-page-container">
      {/* NEW: Wrapper for the banner to add top margin */}
      <Box className="banner-wrapper">
        {/* Top Banner/Card */}
        <div className="bank-accounts-banner">
          {/* Abstract shapes for background */}
          <div className="bank-accounts-banner-shapes">
            <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,50 C80,80 20,80 0,50 Z" fill="currentColor" />
              <path d="M0,20 L100,0 L100,70 C70,100 30,100 0,70 Z" fill="currentColor" className="transform translate-x-10 translate-y-5" />
            </svg>
          </div>

          <div className="bank-accounts-banner-content">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Bank Accounts</h1>
              <p className="text-md md:text-lg opacity-90">Manage all your financial accounts in one place.</p>
            </div>
            <Button
              variant="contained"
              className="add-new-account-button-banner"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
            >
              Add New Account
            </Button>
          </div>
        </div>
      </Box> {/* End of banner-wrapper */}

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, py: 0 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading accounts...</Typography>
          </Box>
        )}

        {!loading && bankAccounts.length === 0 ? (
          <Box sx={{ bgcolor: 'white', p: 6, borderRadius: 3, boxShadow: 3, textAlign: 'center', mt: 5 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Bank Account Detected. Add Account 🏦!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Click the "Add New Account" button to get started.
            </Typography>
          </Box>
        ) : (
          <div className="bank-accounts-grid" style={{ marginTop: '2rem' }}>
            {bankAccounts.map((account) => (
              <div key={account._id} className="bank-account-card">
                {/* Profile Photo/Icon */}
                <div className="bank-account-card-icon-container">
                  {account.profilePhotoUrl ? (
                    <img src={`${BACKEND_BASE_URL}${account.profilePhotoUrl.startsWith('/') ? '' : '/'}${account.profilePhotoUrl}`} alt="Bank Profile" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/CCCCCC/FFFFFF?text=Bank"; }} />
                  ) : (
                    <AccountCircleIcon className="bank-account-card-icon-container-svg" />
                  )}
                </div>

                {/* Account Details */}
                <div className="bank-account-card-details">
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                    {account.bankName} - ({account.accountType})
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Balance: <span className="bank-account-card-balance-value">{account.currency} {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </Typography>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="bank-account-card-actions">
                  <Button
                    variant="contained"
                    className="card-action-button edit"
                    onClick={() => handleOpenEditModal(account)}
                    title="Edit Account"
                  >
                    <EditIcon sx={{ fontSize: 20 }} />
                  </Button>
                  <Button
                    variant="contained"
                    className="card-action-button delete"
                    onClick={() => confirmDelete(account._id)}
                    title="Delete Account"
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <BankAccountFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onAccountSaved={handleAccountSaved}
        currentAccount={currentAccountToEdit}
      />

      <CustomConfirmDialog
        open={openConfirmDialog}
        title="Confirm Deletion"
        message="Are you sure you want to delete this bank account? This action cannot be undone."
        onConfirm={handleDeleteBankAccount}
        onCancel={() => setOpenConfirmDialog(false)}
      />
    </div>
  );
}

export default BankAccounts;
