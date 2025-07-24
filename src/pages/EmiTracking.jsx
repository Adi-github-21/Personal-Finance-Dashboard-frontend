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
import EmiFormModal from '../components/EmiFormModal.jsx';
import API from '../api.jsx';

import './EmiTracking.css'; // <-- Naya: CSS file import kiya

// Helper functions (EMI Calculation, Principal/Interest Breakdown, Date calculations)
const calculateEmi = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return principal / tenureMonths;

  const monthlyRate = annualRate / (12 * 100);
  const n = tenureMonths;
  const emi = principal * monthlyRate * Math.pow((1 + monthlyRate), n) / (Math.pow((1 + monthlyRate), n) - 1);
  return isNaN(emi) ? 0 : emi;
};

const calculatePrincipalInterestBreakdown = (remainingAmount, annualRate, emiAmount) => {
  const monthlyRate = annualRate / (12 * 100);
  const interestPortion = remainingAmount * monthlyRate;
  const principalPortion = emiAmount - interestPortion;

  return {
    interestPortion: interestPortion > 0 ? interestPortion : 0,
    principalPortion: principalPortion > 0 ? principalPortion : 0,
  };
};

const calculateProjectedEndDate = (startDate, loanTenureMonths) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + loanTenureMonths);
  return date;
};

const getProgressPercentage = (totalAmount, remainingAmount) => {
  if (totalAmount <= 0) return 0;
  const paidAmount = totalAmount - remainingAmount;
  return (paidAmount / totalAmount) * 100;
};

// Helper function for Calendar (simplified for now)
const generateCalendarDays = (year, month, emiDueDates) => {
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
    const isHighlighted = emiDueDates.some(
      (dd) => dd.toDateString() === currentDate.toDateString()
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


function EmiTracking() {
  const [openModal, setOpenModal] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLoanToEdit, setCurrentLoanToEdit] = useState(null);

  // For Summary Dashboard
  const [totalOutstandingDebt, setTotalOutstandingDebt] = useState(0);
  const [totalMonthlyEmiOutflow, setTotalMonthlyEmiOutflow] = useState(0);
  const [projectedDebtFreeDate, setProjectedDebtFreeDate] = useState('N/A');

  // For EMI Calendar
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const [emiDueDatesInMonth, setEmiDueDatesInMonth] = useState([]);


  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/loans');
      const fetchedLoans = res.data;

      // Calculate summary metrics
      let sumOutstandingDebt = 0;
      let sumMonthlyEmiOutflow = 0;
      let latestDebtFreeDate = null;
      const allEmiDueDates = [];

      fetchedLoans.forEach(loan => {
        sumOutstandingDebt += loan.remainingAmount;
        sumMonthlyEmiOutflow += loan.emiAmount;

        const projectedEndDate = calculateProjectedEndDate(loan.startDate, loan.loanTenureMonths);
        if (latestDebtFreeDate === null || projectedEndDate > latestDebtFreeDate) {
          latestDebtFreeDate = projectedEndDate;
        }
        allEmiDueDates.push(new Date(loan.nextDueDate)); // Collect all next due dates for calendar
      });

      setTotalOutstandingDebt(sumOutstandingDebt);
      setTotalMonthlyEmiOutflow(sumMonthlyEmiOutflow);
      setProjectedDebtFreeDate(latestDebtFreeDate ? latestDebtFreeDate.toLocaleDateString() : 'N/A');

      setLoans(fetchedLoans);

      // Filter EMI due dates for current calendar month
      const currentMonthDueDates = allEmiDueDates.filter(date =>
        date.getMonth() === currentCalendarMonth && date.getFullYear() === currentCalendarYear
      );
      setEmiDueDatesInMonth(currentMonthDueDates);

    } catch (err) {
      setError(err.response?.data?.message || 'Loans fetch karne mein dikkat hui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [currentCalendarMonth, currentCalendarYear]); // Re-fetch or re-calculate when month/year changes

  const handleOpenAddModal = () => {
    setCurrentLoanToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (loan) => {
    setCurrentLoanToEdit(loan);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentLoanToEdit(null);
    fetchLoans(); // Data refresh karein after save/update
  };

  const handleLoanSaved = (savedLoan) => {
    // This will be handled by fetchLoans() call in handleCloseModal
  };

  const handleDeleteLoan = async (id) => {
    if (window.confirm('Kya aap is loan ko delete karna chahte hain?')) {
      try {
        await API.delete(`/loans/${id}`);
        fetchLoans(); // Data refresh karein after delete
      } catch (err) {
        setError(err.response?.data?.message || 'Loan delete karne mein dikkat hui.');
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
  const calendarDays = generateCalendarDays(currentCalendarYear, currentCalendarMonth, emiDueDatesInMonth);


  return (
    <Container maxWidth="lg" className="emi-container">
      <Box className="emi-header">
        <Typography variant="h4" component="h1" className="emi-title">
          Your Active Loans (EMI Tracking)
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
        >
          Naya Loan Add Karein
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Dashboard */}
      <Grid container spacing={2} className="emi-summary-dashboard">
        <Grid xs={12} sm={4}>
          <Card className="emi-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Outstanding Debt
              </Typography>
              <Typography variant="h5">
                ₹ {totalOutstandingDebt.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card className="emi-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Monthly EMI Outflow
              </Typography>
              <Typography variant="h5">
                ₹ {totalMonthlyEmiOutflow.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card className="emi-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projected Debt-Free Date
              </Typography>
              <Typography variant="h5">
                {projectedDebtFreeDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content: Loan Table and EMI Calendar */}
      <Box className="emi-main-content-section">
        <Box className="emi-table-section"> {/* Loan Table Section */}
          {loans.length === 0 ? (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
              Abhi koi active loan nahi hai. Naya add karein!
            </Typography>
          ) : (
            <Paper elevation={3} className="emi-table-paper">
              <TableContainer>
                <Table className="emi-table" aria-label="loan table">
                  <TableHead className="emi-table-head">
                    <TableRow>
                      <TableCell>Loan Name (Type)</TableCell>
                      <TableCell align="right">Total Loan Amount</TableCell>
                      <TableCell align="right">Remaining Amount</TableCell>
                      <TableCell align="right">EMI Amount</TableCell>
                      <TableCell align="right">Next Due Date</TableCell>
                      <TableCell align="right">Interest Rate</TableCell>
                      <TableCell align="center">Progress</TableCell>
                      <TableCell align="center">EMI Breakdown</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.map((loan) => {
                      const projectedEndDate = calculateProjectedEndDate(loan.startDate, loan.loanTenureMonths);
                      const progressPercentage = getProgressPercentage(loan.totalLoanAmount, loan.remainingAmount);
                      const { principalPortion, interestPortion } = calculatePrincipalInterestBreakdown(loan.remainingAmount, loan.interestRate, loan.emiAmount);

                      // For conic-gradient pie chart
                      const principalPercentage = loan.emiAmount > 0 ? (principalPortion / loan.emiAmount) * 100 : 0;
                      const interestPercentage = loan.emiAmount > 0 ? (interestPortion / loan.emiAmount) * 100 : 0;

                      return (
                        <TableRow
                          key={loan._id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell className="emi-table-cell">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {/* Loan Type Icon - Placeholder for now */}
                              <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                                {loan.loanType === 'Home Loan' && <HomeIcon fontSize="small" />}
                                {loan.loanType === 'Car Loan' && <DirectionsCarIcon fontSize="small" />}
                                {loan.loanType === 'Personal Loan' && <PersonIcon fontSize="small" />}
                                {loan.loanType === 'Education Loan' && <SchoolIcon fontSize="small" />}
                                {loan.loanType === 'Other' && <HelpOutlineIcon fontSize="small" />}
                              </Typography>
                              <Typography variant="body1">{loan.loanName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" className="emi-table-cell">₹ {loan.totalLoanAmount.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" className="emi-table-cell">₹ {loan.remainingAmount.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" className="emi-table-cell">₹ {loan.emiAmount.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" className="emi-table-cell">{new Date(loan.nextDueDate).toLocaleDateString()}</TableCell>
                          <TableCell align="right" className="emi-table-cell">{loan.interestRate.toFixed(2)}%</TableCell>
                          <TableCell align="center" className="emi-table-cell">
                            <Box className="progress-bar-container">
                              <Box className="progress-bar-fill" sx={{ width: `${progressPercentage}%` }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {progressPercentage.toFixed(1)}% Paid
                            </Typography>
                          </TableCell>
                          <TableCell align="center" className="emi-table-cell">
                            <Box
                              className="pie-chart-container"
                              sx={{
                                background: `conic-gradient(
                                  ${theme.palette.secondary.main} 0% ${principalPercentage}%,
                                  ${theme.palette.primary.light} ${principalPercentage}% 100%
                                )`
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'white' }}>
                                {principalPercentage.toFixed(0)}% P
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              P: ₹{principalPortion.toFixed(0)} | I: ₹{interestPortion.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" className="emi-table-cell">
                            <IconButton aria-label="edit" onClick={() => handleOpenEditModal(loan)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton aria-label="delete" onClick={() => handleDeleteLoan(loan._id)}>
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
          {/* Prepayment Calculator Section */}
          <Box className="prepayment-calculator-section">
            <Typography variant="h6" gutterBottom>Prepayment Calculator</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Plan an extra payment to save on interest and reduce tenure.
            </Typography>
            <Button variant="contained" color="primary" sx={{ textTransform: 'none' }}>
                Plan a Prepayment
            </Button>
          </Box>
        </Box>

        {/* EMI Calendar Section */}
        <Box className="emi-calendar-section">
          <Box className="emi-calendar-header">
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
          <Grid container className="emi-calendar-grid">
            {daysOfWeek.map(day => (
              <Grid xs={1.71} key={day}>
                <Typography variant="caption" className="emi-calendar-day-header">{day}</Typography>
              </Grid>
            ))}
            {calendarDays.map((dayData, index) => (
              <Grid xs={1.71} key={index}>
                <Typography
                  variant="body2"
                  className={`emi-calendar-day ${dayData.isCurrentMonth ? 'current-month' : ''} ${dayData.isHighlighted ? 'highlighted' : ''} ${dayData.isToday ? 'today' : ''}`}
                >
                  {dayData.day}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <EmiFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onLoanSaved={handleLoanSaved}
        currentLoan={currentLoanToEdit}
      />
    </Container>
  );
}

export default EmiTracking;
