import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications'; 
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FixedDepositFormModal from '../components/FixedDepositFormModal.jsx';
import API from '../api.jsx';

import './FixedDeposits.css'; // <-- Naya: CSS file import kiya

// Helper function to calculate Maturity Date
const calculateMaturityDate = (startDate, tenureMonths) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + tenureMonths);
  return date;
};

// Helper function to calculate Maturity Amount (Simple Interest for now)
const calculateMaturityAmount = (principal, rate, tenureMonths) => {
  // Simple Interest Formula: P * (1 + R * T)
  // Rate is in percentage, tenure in months. Convert rate to decimal and tenure to years.
  const rateDecimal = rate / 100;
  const tenureYears = tenureMonths / 12;
  return principal * (1 + rateDecimal * tenureYears);
};

// Helper function to get FD Status
const getFdStatus = (maturityDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare only dates
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);

  const diffTime = maturity.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'Matured', className: 'status-matured' };
  } else if (diffDays <= 30) { // Nearing maturity if within 30 days
    return { status: 'Nearing Maturity', className: 'status-nearing-maturity' };
  } else {
    return { status: 'Active', className: 'status-active' };
  }
};

// Helper function for Calendar (simplified for now)
const generateCalendarDays = (year, month, maturityDates) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];

  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: '', isCurrentMonth: false });
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(year, month, i);
    const isHighlighted = maturityDates.some(
      (md) => md.toDateString() === currentDate.toDateString()
    );
    const isToday = currentDate.toDateString() === new Date().toDateString();

    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isHighlighted,
      isToday,
      date: currentDate,
    });
  }
  return calendarDays;
};


function FixedDeposits() {
  const [openModal, setOpenModal] = useState(false);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFixedDepositToEdit, setCurrentFixedDepositToEdit] = useState(null);

  // For Summary Dashboard
  const [totalPrincipal, setTotalPrincipal] = useState(0);
  const [totalCorpus, setTotalCorpus] = useState(0);
  const [averageInterestRate, setAverageInterestRate] = useState(0);

  // For Maturity Timeline Calendar
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const [maturityDatesInMonth, setMaturityDatesInMonth] = useState([]);


  const fetchFixedDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/fixeddeposits');
      const fetchedFds = res.data;

      // Calculate summary metrics
      let sumPrincipal = 0;
      let sumCorpus = 0;
      let sumRateXPrincipal = 0;
      let totalPrincipalForAvg = 0;
      const allMaturityDates = [];

      fetchedFds.forEach(fd => {
        const maturityDate = calculateMaturityDate(fd.startDate, fd.tenure);
        const maturityAmount = calculateMaturityAmount(fd.principalAmount, fd.interestRate, fd.tenure);

        sumPrincipal += fd.principalAmount;
        sumCorpus += maturityAmount;
        allMaturityDates.push(maturityDate);

        // For weighted average interest rate
        sumRateXPrincipal += (fd.interestRate * fd.principalAmount);
        totalPrincipalForAvg += fd.principalAmount;
      });

      setTotalPrincipal(sumPrincipal);
      setTotalCorpus(sumCorpus);
      setAverageInterestRate(totalPrincipalForAvg > 0 ? (sumRateXPrincipal / totalPrincipalForAvg).toFixed(2) : 0);

      setFixedDeposits(fetchedFds);

      // Filter maturity dates for current calendar month
      const currentMonthMaturities = allMaturityDates.filter(date =>
        date.getMonth() === currentCalendarMonth && date.getFullYear() === currentCalendarYear
      );
      setMaturityDatesInMonth(currentMonthMaturities);

    } catch (err) {
      setError(err.response?.data?.message || 'Problem in feteching Fixed Deposit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixedDeposits();
  }, [currentCalendarMonth, currentCalendarYear]); // Re-fetch or re-calculate when month/year changes

  const handleOpenAddModal = () => {
    setCurrentFixedDepositToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (fd) => {
    setCurrentFixedDepositToEdit(fd);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentFixedDepositToEdit(null);
    fetchFixedDeposits(); // Data refresh karein after save/update
  };

  const handleFixedDepositSaved = (savedFd) => {
    // This will be handled by fetchFixedDeposits() call in handleCloseModal
    // No need to manually update state here
  };

  const handleDeleteFixedDeposit = async (id) => {
    if (window.confirm('Do you really want to Delete this Fixed Deposit?')) {
      try {
        await API.delete(`/fixeddeposits/${id}`);
        fetchFixedDeposits(); // Data refresh karein after delete
      } catch (err) {
        setError(err.response?.data?.message || 'Problem in deleting Fixed Deposit.');
      }
    }
  };

  // Calendar Navigation
  const goToPreviousMonth = () => {
    if (currentCalendarMonth === 0) {
      setCurrentCalendarMonth(11);
      setCurrentCalendarYear(prev => prev - 1);
    } else {
      setCurrentCalendarMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentCalendarMonth === 11) {
      setCurrentCalendarMonth(0);
      setCurrentCalendarYear(prev => prev + 1);
    } else {
      setCurrentCalendarMonth(prev => prev + 1);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const calendarDays = generateCalendarDays(currentCalendarYear, currentCalendarMonth, maturityDatesInMonth);


  return (
   <Box className="fd-page-wrapper"> 
    <Container maxWidth="lg" className="fd-container">
      <Box className="fd-header">
        <Typography variant="h4" component="h1" className="fd-title">
          Your Fixed Deposits
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
        >
          ADD FD
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Dashboard */}
      <Grid container spacing={2} className="summary-dashboard">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Principal Invested
              </Typography>
              <Typography variant="h5">
                ₹ {totalPrincipal.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Corpus Expected
              </Typography>
              <Typography variant="h5">
                ₹ {totalCorpus.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="summary-card green-bg">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Interest Rate
              </Typography>
              <Typography variant="h5">
                {averageInterestRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Card className="summary-card" sx={{ bgcolor: '#212121', color: 'white' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#bdbdbd' }}>Alerts</Typography>
                        <IconButton size="small" sx={{ color: 'white' }}>
                            <NotificationsIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        No new alerts.
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* Main Content: Table and Calendar */}
      <Box className="maturity-timeline-section">
        <Box className="fd-table-section"> {/* Table Section */}
          {fixedDeposits.length === 0 ? (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
              No Fixed Deposit Added. Add New FD's!
            </Typography>
          ) : (
            <Paper elevation={3} className="fd-table-paper">
              <TableContainer>
                <Table className="fd-table" aria-label="fixed deposit table">
                  <TableHead className="fd-table-head">
                    <TableRow>
                      <TableCell>Bank Name</TableCell>
                      <TableCell align="right">Principal Amount</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell align="right">Start Date</TableCell>
                      <TableCell align="right">Maturity Date</TableCell>
                      <TableCell align="right">Tenure</TableCell>
                      <TableCell align="right">Maturity Amount</TableCell>
                      <TableCell align="right">Total Interest</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fixedDeposits.map((fd) => {
                      const maturityDate = calculateMaturityDate(fd.startDate, fd.tenure);
                      const maturityAmount = calculateMaturityAmount(fd.principalAmount, fd.interestRate, fd.tenure);
                      const totalInterest = maturityAmount - fd.principalAmount;
                      const fdStatus = getFdStatus(maturityDate);

                      return (
                        <TableRow
                          key={fd._id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell className="fd-table-cell">{fd.bankName}</TableCell>
                          <TableCell align="right" className="fd-table-cell">₹ {fd.principalAmount.toFixed(2)}</TableCell>
                          <TableCell align="right" className="fd-table-cell">{fd.interestRate.toFixed(2)}%</TableCell>
                          <TableCell align="right" className="fd-table-cell">{new Date(fd.startDate).toLocaleDateString()}</TableCell>
                          <TableCell align="right" className="fd-table-cell">{maturityDate.toLocaleDateString()}</TableCell>
                          <TableCell align="right" className="fd-table-cell">{fd.tenure} Months</TableCell>
                          <TableCell align="right" className="fd-table-cell">₹ {maturityAmount.toFixed(2)}</TableCell>
                          <TableCell align="right" className="fd-table-cell">₹ {totalInterest.toFixed(2)}</TableCell>
                          <TableCell align="center" className="fd-table-cell">
                            <span className={`status-badge ${fdStatus.className}`}>
                              {fdStatus.status}
                            </span>
                          </TableCell>
                          <TableCell align="center" className="fd-table-cell">
                            <IconButton aria-label="edit" onClick={() => handleOpenEditModal(fd)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton aria-label="delete" onClick={() => handleDeleteFixedDeposit(fd._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          {/* Export to Sheets Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" className="export-button">
              Export to Sheets
            </Button>
          </Box>
        </Box>

        {/* Maturity Timeline Calendar Section */}
        <Box className="calendar-section">
          <Box className="calendar-header">
            <IconButton onClick={goToPreviousMonth} color="inherit">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6">
              {monthNames[currentCalendarMonth]} {currentCalendarYear}
            </Typography>
            <IconButton onClick={goToNextMonth} color="inherit">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>

      <Grid container className="calendar-grid">
        {daysOfWeek.map(day => (
          <Grid item xs={1.71} key={day}> 
            <Typography variant="caption" className="calendar-day-header">{day}</Typography>
          </Grid>
        ))}
        {calendarDays.map((dayData, index) => (
          <Grid item xs={1.71} key={index}>
            <Typography
              variant="body2"
              className={`calendar-day ${dayData.isCurrentMonth ? 'current-month' : ''} ${dayData.isHighlighted ? 'highlighted' : ''} ${dayData.isToday ? 'today' : ''}`}
            >
              {dayData.day}
            </Typography>
          </Grid>
        ))}
      </Grid>

        </Box>
      </Box>

      <FixedDepositFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onFixedDepositSaved={handleFixedDepositSaved}
        currentFixedDeposit={currentFixedDepositToEdit}
      />
    </Container>
   </Box> 
  );
}

export default FixedDeposits;
