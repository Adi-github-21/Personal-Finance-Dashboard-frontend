import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// Naya naam: BankAccountFormModal
import BankAccountFormModal from '../components/BankAccountFormModal.jsx';
import API from '../api.jsx';

function BankAccounts() {
  const [openModal, setOpenModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAccountToEdit, setCurrentAccountToEdit] = useState(null); // Naya state: edit karne ke liye account

  const fetchBankAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/bankaccounts');
      setBankAccounts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Bank accounts fetch karne mein dikkat hui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentAccountToEdit(null); // Add mode ke liye currentAccountToEdit ko null karein
    setOpenModal(true);
  };

  const handleOpenEditModal = (account) => {
    setCurrentAccountToEdit(account); // Edit mode ke liye account set karein
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentAccountToEdit(null); // Modal band hone par reset karein
  };

  const handleAccountSaved = (savedAccount) => {
    // Agar account update hua hai
    if (currentAccountToEdit) {
      setBankAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account._id === savedAccount._id ? savedAccount : account
        )
      );
    } else {
      // Agar naya account add hua hai
      setBankAccounts((prevAccounts) => [...prevAccounts, savedAccount]);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    if (window.confirm('Kya aap is bank account ko delete karna chahte hain?')) {
      try {
        await API.delete(`/bankaccounts/${id}`);
        setBankAccounts((prevAccounts) => prevAccounts.filter((account) => account._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Bank account delete karne mein dikkat hui.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bank Accounts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal} // Add modal open karein
        >
          Add New Account 
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {bankAccounts.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
          No Bank Account Detected.Add Account🏦!
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <List>
            {bankAccounts.map((account, index) => (
              <React.Fragment key={account._id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {account.bankName} - ({account.accountType})
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" color="text.secondary">
                        Balance: {account.currency} {account.balance.toFixed(2)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(account)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteBankAccount(account._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < bankAccounts.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <BankAccountFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onAccountSaved={handleAccountSaved}
        currentAccount={currentAccountToEdit} // Edit mode ke liye account pass karein
      />
    </Container>
  );
}

export default BankAccounts;
