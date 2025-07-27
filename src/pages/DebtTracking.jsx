import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Avatar, // For person avatars
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Default avatar icon
import API from '../api.jsx';
import DebtFormModal from '../components/DebtFormModal.jsx';

import './DebtTracking.css'; // <-- Naya: CSS file import kiya

// Helper function to group debts by person and calculate net balance
const groupDebtsByPerson = (debts) => {
  const grouped = {};
  debts.forEach(debt => {
    if (!grouped[debt.personName]) {
      grouped[debt.personName] = {
        owedToMe: 0,
        iOwe: 0,
        pendingDebts: [],
        paidDebts: [], // For history
      };
    }
    if (debt.status === 'Pending') {
      if (debt.type === 'Owed To Me') {
        grouped[debt.personName].owedToMe += debt.amount;
      } else { // I Owe
        grouped[debt.personName].iOwe += debt.amount;
      }
      grouped[debt.personName].pendingDebts.push(debt);
    } else { // Paid
      grouped[debt.personName].paidDebts.push(debt);
    }
  });

  // Calculate net balance for each person
  Object.keys(grouped).forEach(personName => {
    const net = grouped[personName].owedToMe - grouped[personName].iOwe;
    grouped[personName].netBalance = net;
    grouped[personName].netBalanceType = net >= 0 ? 'owed-to-me' : 'i-owe';
  });

  return grouped;
};


function DebtTracking() {
  const [openModal, setOpenModal] = useState(false);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDebtToEdit, setCurrentDebtToEdit] = useState(null);

  // For Summary Dashboard
  const [totalIOwe, setTotalIOwe] = useState(0);
  const [totalOwedToMe, setTotalOwedToMe] = useState(0);
  const [myNetPosition, setMyNetPosition] = useState(0);
  const [myNetPositionType, setMyNetPositionType] = useState('net-positive'); // For color coding

  const fetchDebts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/debts');
      const fetchedDebts = res.data;

      // Calculate summary metrics
      let sumIOwe = 0;
      let sumOwedToMe = 0;

      fetchedDebts.forEach(debt => {
        if (debt.status === 'Pending') { // Only count pending debts for summary
          if (debt.type === 'I Owe') {
            sumIOwe += debt.amount;
          } else { // Owed To Me
            sumOwedToMe += debt.amount;
          }
        }
      });

      const netPosition = sumOwedToMe - sumIOwe;

      setTotalIOwe(sumIOwe);
      setTotalOwedToMe(sumOwedToMe);
      setMyNetPosition(netPosition);
      setMyNetPositionType(netPosition >= 0 ? 'net-positive' : 'net-negative');

      setDebts(fetchedDebts); // Store all debts, pending and paid

    } catch (err) {
      setError(err.response?.data?.message || 'Debts fetch karne mein dikkat hui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentDebtToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (debt) => {
    setCurrentDebtToEdit(debt);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentDebtToEdit(null);
    fetchDebts(); // Data refresh karein after save/update
  };

  const handleDebtSaved = (savedDebt) => {
    // This will be handled by fetchDebts() call in handleCloseModal
  };

  const handleSettleDebt = async (id) => {
    if (window.confirm('Kya aap is debt ko settle (Paid) karna chahte hain?')) {
      try {
        // Backend API call to mark as paid
        await API.post(`/debts/${id}/settle`);
        fetchDebts(); // Data refresh karein
      } catch (err) {
        setError(err.response?.data?.message || 'Debt settle karne mein dikkat hui.');
      }
    }
  };

  const handleDeleteDebt = async (id) => {
    if (window.confirm('Kya aap is debt entry ko delete karna chahte hain?')) {
      try {
        await API.delete(`/debts/${id}`);
        fetchDebts(); // Data refresh karein
      } catch (err) {
        setError(err.response?.data?.message || 'Debt entry delete karne mein dikkat hui.');
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

  const groupedDebts = groupDebtsByPerson(debts.filter(d => d.status === 'Pending')); // Only pending debts for grouping in UI

  return (
    <Container maxWidth="lg" className="debt-container">
      <Box className="debt-header">
        <Typography variant="h4" component="h1" className="debt-title">
          Debt Tracking
        </Typography>
        {/* Add New Debt buttons - will use one modal for both types */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
          >
            Naya Debt Add Karein
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Dashboard */}
      <Grid container spacing={2} className="debt-summary-dashboard">
        <Grid item xs={12} sm={4}>
          <Card className="debt-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total I Owe
              </Typography>
              <Typography variant="h5" className="amount-owe">
                ₹ {totalIOwe.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="debt-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Owed To Me
              </Typography>
              <Typography variant="h5" className="amount-owed-to-me">
                ₹ {totalOwedToMe.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className="debt-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Net Position
              </Typography>
              <Typography variant="h5" className={myNetPositionType === 'net-positive' ? 'amount-net-positive' : 'amount-net-negative'}>
                {myNetPosition >= 0 ? '+' : ''}₹ {myNetPosition.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Your Balances Section (Grouped by Person) */}
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Your Balances
      </Typography>
      <Box className="balances-section">
        {Object.keys(groupedDebts).length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5, width: '100%' }}>
            Abhi koi pending debts nahi hain. Naya debt add karein!
          </Typography>
        ) : (
          Object.keys(groupedDebts).map(personName => (
            <Paper key={personName} elevation={3} className="person-balance-card">
              <Box className="person-header">
                <Avatar sx={{ bgcolor: 'primary.light', mr: 1 }}>
                  <AccountCircleIcon />
                </Avatar>
                <Typography variant="h6">{personName}</Typography>
              </Box>
              <Typography variant="body1" className={`person-net-balance ${groupedDebts[personName].netBalanceType === 'owed-to-me' ? 'owed-to-me' : 'owe'}`}>
                {groupedDebts[personName].netBalanceType === 'owed-to-me' ? 'He owes you' : 'You owe him'} ₹ {Math.abs(groupedDebts[personName].netBalance).toLocaleString('en-IN')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Individual Pending Debts for this person */}
              <Box>
                {groupedDebts[personName].pendingDebts.map(debt => (
                  <Box key={debt._id} className="debt-item">
                    <Box className="debt-item-info">
                      <Typography variant="body1">{debt.description}</Typography>
                      <Typography variant="body2">{debt.category} | {new Date(debt.transactionDate).toLocaleDateString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" className={`debt-item-amount ${debt.type === 'Owed To Me' ? 'owed-to-me' : 'owe'}`}>
                        {debt.type === 'Owed To Me' ? '+' : '-'}₹ {debt.amount.toLocaleString('en-IN')}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        className="settle-button"
                        onClick={() => handleSettleDebt(debt._id)}
                      >
                        Settle
                      </Button>
                      <IconButton size="small" onClick={() => handleOpenEditModal(debt)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteDebt(debt._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Add New Debt buttons for this person (Optional, can be done via main modal) */}
              {/* <Box className="add-debt-buttons">
                <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={() => handleOpenAddModal()}>Add I Owe</Button>
                <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={() => handleOpenAddModal()}>Add Owed To Me</Button>
              </Box> */}
            </Paper>
          ))
        )}
      </Box>

      {/* Debt Form Modal */}
      <DebtFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onDebtSaved={handleDebtSaved}
        currentDebt={currentDebtToEdit}
      />

      {/* Settled Debts History (Optional, can be a separate section/modal) */}
      <Typography variant="h5" component="h2" sx={{ mt: 5, mb: 3 }}>
        Settled Debts History
      </Typography>
      <Box>
        {debts.filter(d => d.status === 'Paid').length === 0 ? (
          <Typography variant="body1" color="text.secondary">No settled debts yet.</Typography>
        ) : (
          // Display paid debts here, perhaps grouped by person or in a simple list
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <List>
              {debts.filter(d => d.status === 'Paid').map(debt => (
                <ListItem key={debt._id}>
                  <ListItemText
                    primary={`${debt.personName} - ${debt.description}`}
                    secondary={`Amount: ₹${debt.amount.toLocaleString('en-IN')} | Settled on: ${new Date(debt.transactionDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default DebtTracking;
