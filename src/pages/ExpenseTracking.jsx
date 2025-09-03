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
  Fab, // Floating Action Button
  useTheme, // For theme colors in conic-gradient
  Icon,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FlashOnIcon from '@mui/icons-material/FlashOn'; // For Automated icon
import CreateIcon from '@mui/icons-material/Create'; // For Manual icon
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Example category icon
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HomeIcon from '@mui/icons-material/Home'; // For Bills/Rent
import SchoolIcon from '@mui/icons-material/School'; // For Education
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'; // For Health
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'; // For Transport
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // For Entertainment
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'; // For Other category

import ExpenseFormModal from '../components/ExpenseFormModal.jsx';
import API from '../api.jsx';

import './ExpenseTracking.css'; // <-- Naya: CSS file import kiya

// Helper function to get category icon
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food': return <FastfoodIcon fontSize="small" />;
    case 'Travel': return <FlightTakeoffIcon fontSize="small" />;
    case 'Shopping': return <ShoppingCartIcon fontSize="small" />;
    case 'Bills': return <HomeIcon fontSize="small" />;
    case 'Entertainment': return <SportsEsportsIcon fontSize="small" />;
    case 'Transport': return <DirectionsBusIcon fontSize="small" />;
    case 'Health': return <LocalHospitalIcon fontSize="small" />;
    case 'Education': return <SchoolIcon fontSize="small" />;
    default: return <MoreHorizIcon fontSize="small" />;
  }
};

// Helper function to group expenses by date
const groupExpensesByDate = (expenses) => {
  const grouped = {};
  expenses.forEach(expense => {
    const date = new Date(expense.transactionDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(expense);
  });
  return grouped;
};

function ExpenseTracking() {
  const theme = useTheme(); // Use theme for colors

  const [openModal, setOpenModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentExpenseToEdit, setCurrentExpenseToEdit] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false); // Google connection status
  const [syncing, setSyncing] = useState(false); // Syncing status
  const [syncMessage, setSyncMessage] = useState(''); // Sync message

  // For Summary Dashboard
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
  const [highestBuy, setHighestBuy] = useState({ amount: 0, description: 'N/A' });
  const [averageDailySpend, setAverageDailySpend] = useState(0);
  const [topSpendingCategory, setTopSpendingCategory] = useState({ name: 'N/A', percentage: 0 }); // For pie chart placeholder

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/expenses');
      const fetchedExpenses = res.data;

      // Filter for current month's expenses for summary
      const now = new Date();
      const currentMonthExpenses = fetchedExpenses.filter(exp => {
        const expDate = new Date(exp.transactionDate);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });
      
      // Calculate Summary Metrics
      let sumMonthly = 0;
      let maxBuy = { amount: 0, description: 'N/A' };
      const dailySpends = {}; // { 'YYYY-MM-DD': total_spend }
      const categorySpends = {}; // { 'Category': total_spend }

      currentMonthExpenses.forEach(exp => {
        sumMonthly += exp.amount;
        if (exp.amount > maxBuy.amount) {
          maxBuy = { amount: exp.amount, description: exp.description };
        }

        const dateKey = new Date(exp.transactionDate).toISOString().split('T')[0];
        dailySpends[dateKey] = (dailySpends[dateKey] || 0) + exp.amount;

        categorySpends[exp.category] = (categorySpends[exp.category] || 0) + exp.amount;
      });

      const uniqueDaysInMonth = Object.keys(dailySpends).length;
      setTotalMonthlyExpense(sumMonthly);
      setHighestBuy(maxBuy);
      setAverageDailySpend(uniqueDaysInMonth > 0 ? (sumMonthly / uniqueDaysInMonth).toFixed(2) : 0);

      // Top Spending Category
      let topCatName = 'N/A';
      let topCatAmount = 0;
      Object.keys(categorySpends).forEach(cat => {
        if (categorySpends[cat] > topCatAmount) {
          topCatAmount = categorySpends[cat];
          topCatName = cat;
        }
      });
      setTopSpendingCategory({
        name: topCatName,
        percentage: sumMonthly > 0 ? (topCatAmount / sumMonthly * 100).toFixed(0) : 0
      });


      setExpenses(fetchedExpenses);

    } catch (err) {
      setError(err.response?.data?.message || 'Problem in feteching expenses.');
    } finally {
      setLoading(false);
    }
  };

  // Check Google connection status on mount
  useEffect(() => {
    fetchExpenses();
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      setGoogleConnected(true);
      setSyncMessage('Google account successfully connected!');
      // URL se query parameter hatayein
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // You might want to check for an existing GoogleToken in DB here
    // by making an API call to /api/google/status or similar
  }, []);

  const handleOpenAddModal = () => {
    setCurrentExpenseToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (expense) => {
    setCurrentExpenseToEdit(expense);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentExpenseToEdit(null);
    fetchExpenses(); // Data refresh karein after save/update
  };

  const handleExpenseSaved = (savedExpense) => {
    // This will be handled by fetchExpenses() call in handleCloseModal
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Do you really want to delete this expense?')) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchExpenses(); // Data refresh karein after delete
      } catch (err) {
        setError(err.response?.data?.message || 'Problem in deleting Expense.');
      }
    }
  };

  // Google Connect Handler
  const handleConnectGoogle = () => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // If there's no token, show an error and stop.
  if (!token) {
    setError('You must be logged in to connect your Google account.');
    // It's good practice to clear any old sync messages
    setSyncMessage(''); 
    return;
  }

  // Use the baseURL from your configured API instance and append the token
  const connectUrl = `${API.defaults.baseURL}/google/connect?token=${token}`;
  
  // Log the URL to the console for debugging to make sure it's correct
  console.log('Redirecting to:', connectUrl); 
  
  // Redirect the browser to the new URL
  window.location.href = connectUrl;
};

  // Sync Expenses Handler
  const handleSyncExpenses = async () => {
    setSyncing(true);
    setSyncMessage('');
    setError('');
    try {
      const res = await API.get('/google/sync-expenses');
      setSyncMessage(res.data.message);
      fetchExpenses(); // Expenses refresh karein
    } catch (err) {
      setError(err.response?.data?.message || 'Expenses sync karne mein dikkat hui.');
      if (err.response?.status === 401) { // Token expired case
        setGoogleConnected(false); // Reconnect karne ke liye banner dikhao
      }
    } finally {
      setSyncing(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const groupedExpenses = groupExpensesByDate(expenses);

  return (
   <Box className = "expense-page-wrapper"> 
    <Container maxWidth="lg" className="expense-container">
      <Box className="expense-header">
        <Typography variant="h4" component="h1" className="expense-title">
          Expense Tracking
        </Typography>
        {/* Add New Expense FAB will be at bottom right */}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Dashboard */}
      <Grid container spacing={2} className="expense-summary-dashboard">
        <Grid item xs={12} sm={6} md={3} >
          <Card className="expense-summary-card1" >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Monthly Expense
              </Typography>
              <Typography variant="h5">
                ₹ {totalMonthlyExpense.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="expense-summary-card2">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Highest Buy
              </Typography>
              <Typography variant="h5">
                ₹ {highestBuy.amount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {highestBuy.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="expense-summary-card3">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avg. Daily Spend
              </Typography>
              <Typography variant="h5">
                ₹ {averageDailySpend.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="expense-summary-card4">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Spending Category
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5">{topSpendingCategory.name}</Typography>
                <Box
                  className="top-category-chart-placeholder"
                  sx={{
                    background: `conic-gradient(
                      ${theme.palette.primary.main} 0% ${topSpendingCategory.percentage}%,
                      ${theme.palette.grey[700]} ${topSpendingCategory.percentage}% 100%
                    )`
                  }}
                >
                  <Typography variant="caption">{topSpendingCategory.percentage}%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Connect with Google Banner */}
      {!googleConnected ? (
        <Box className="connect-banner">
          <Button variant="contained" className="connect-button" onClick={handleConnectGoogle} startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google Logo" style={{ height: '20px', marginRight: '8px' }} />}>
            Connect with Google
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <FlashOnIcon />}
            onClick={handleSyncExpenses}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Expenses from Gmail'}
          </Button>
        </Box>
      )}

      {/* Unified Transaction List */}
      <Box className="transaction-list-section">
        {expenses.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
            NO Expense Avilable. Add new expense!
          </Typography>
        ) : (
          Object.keys(groupedExpenses).map(dateKey => (
            <Box key={dateKey}>
              <Typography variant="h6" className="transaction-group-header">
                {dateKey}
              </Typography>
              {groupedExpenses[dateKey].map(expense => (
                <Box key={expense._id} className="transaction-item">
                  <Box className="transaction-item-left">
                    <Typography variant="body2" className={`transaction-icon ${expense.source === 'Manual' ? 'manual' : 'automated'}`}>
                      {expense.source === 'Manual' ? <CreateIcon fontSize="small" /> : <FlashOnIcon fontSize="small" />}
                    </Typography>
                    <Typography variant="body2" className="transaction-icon">
                      {getCategoryIcon(expense.category)}
                    </Typography>
                    <Box className="transaction-details">
                      <Typography variant="body1">{expense.description}</Typography>
                      <Typography variant="body2">{expense.category} | {new Date(expense.transactionDate).toLocaleDateString()} {new Date(expense.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" className="transaction-amount">
                      - ₹ {expense.amount.toLocaleString('en-IN')}
                    </Typography>
                    <IconButton size="small" onClick={() => handleOpenEditModal(expense)}>
                      <EditIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteExpense(expense._id)}>
                      <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ))
        )}
      </Box>

      {/* Floating Action Button (FAB) for Add New Expense */}
      <Fab color="secondary" aria-label="add" className="fab-container" onClick={handleOpenAddModal}>
        <AddIcon />
      </Fab>

      <ExpenseFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onExpenseSaved={handleExpenseSaved}
        currentExpense={currentExpenseToEdit}
      />
    </Container>
   </Box> 
  );
}

export default ExpenseTracking;
