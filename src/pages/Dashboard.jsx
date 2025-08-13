// personal-finance-dashboard-frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  useTheme,
  Paper,
} from '@mui/material';
import API from '../api.jsx';

// Chart.js imports
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  PointElement, // Line chart ke liye
  LineElement,  // Line chart ke liye
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2'; // Line chart bhi import kiya

// Chart.js ko register karein taaki charts render ho sakein
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle, PointElement, LineElement);

import './Dashboard.css'; // <-- Naya: CSS file import kiya

function Dashboard() {
  const theme = useTheme();
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/dashboard/summary');
      setSummaryData(res.data.summary);
      setChartData(res.data.chartsData);
    } catch (err) {
      console.error("Dashboard fetch error:", err); // Debugging
      setError(err.response?.data?.message || 'Dashboard data fetch karne mein dikkat hui. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Chart Data Definitions ---
  // Ensure chartData is not null before accessing its properties

  // 1. Expense Category Breakdown (Doughnut Chart)
  const expenseDoughnutData = {
    labels: chartData?.expenseCategoryBreakdown ? Object.keys(chartData.expenseCategoryBreakdown) : [],
    datasets: [
      {
        label: 'Monthly Expense',
        data: chartData?.expenseCategoryBreakdown ? Object.values(chartData.expenseCategoryBreakdown) : [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.success.main,
          theme.palette.grey[600],
          theme.palette.grey[400],
        ],
        borderColor: theme.palette.background.paper, // Chart background color
        borderWidth: 2,
      },
    ],
  };
  const expenseDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: theme.palette.text.primary } },
      title: { display: true, text: 'Monthly Expense Breakdown', color: theme.palette.text.primary },
    },
  };

  // 2. Investment Distribution (Bar Chart)
  const investmentBarData = {
    labels: chartData?.investmentDistribution ? Object.keys(chartData.investmentDistribution) : [],
    datasets: [
      {
        label: 'Current Value',
        data: chartData?.investmentDistribution ? Object.values(chartData.investmentDistribution) : [],
        backgroundColor: theme.palette.primary.light,
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };
  const investmentBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Investments by Value', color: theme.palette.text.primary },
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] },
      },
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] },
      },
    },
  };

  // 3. Bank Balance Distribution (Bar Chart)
  const bankBalanceBarData = {
    labels: chartData?.bankBalanceDistribution ? Object.keys(chartData.bankBalanceDistribution) : [],
    datasets: [
      {
        label: 'Balance',
        data: chartData?.bankBalanceDistribution ? Object.values(chartData.bankBalanceDistribution) : [],
        backgroundColor: theme.palette.info.main, // Light blue
        borderColor: theme.palette.info.dark,
        borderWidth: 1,
      },
    ],
  };
  const bankBalanceBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bank Balances', color: theme.palette.text.primary },
    },
    scales: {
      x: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } },
      y: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } },
    },
  };

  // 4. Fixed Deposit Principal Distribution (Doughnut Chart)
  const fdDoughnutData = {
    labels: chartData?.fdPrincipalDistribution ? Object.keys(chartData.fdPrincipalDistribution) : [],
    datasets: [
      {
        label: 'Principal Amount',
        data: chartData?.fdPrincipalDistribution ? Object.values(chartData.fdPrincipalDistribution) : [],
        backgroundColor: [
          theme.palette.success.main, // Green
          theme.palette.warning.main, // Orange
          theme.palette.primary.light, // Light Blue
          theme.palette.error.light,   // Light Red
          theme.palette.grey[500],
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };
  const fdDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: theme.palette.text.primary } },
      title: { display: true, text: 'FD Principal Distribution', color: theme.palette.text.primary },
    },
  };

  // 5. Loan Outstanding by Type (Bar Chart)
  const loanBarData = {
    labels: chartData?.loanTypeOutstanding ? Object.keys(chartData.loanTypeOutstanding) : [],
    datasets: [
      {
        label: 'Remaining Amount',
        data: chartData?.loanTypeOutstanding ? Object.values(chartData.loanTypeOutstanding) : [],
        backgroundColor: theme.palette.error.light, // Light red
        borderColor: theme.palette.error.main,
        borderWidth: 1,
      },
    ],
  };
  const loanBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Loans Outstanding by Type', color: theme.palette.text.primary },
    },
    scales: {
      x: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } },
      y: { ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } },
    },
  };

  // 6. Debt Breakdown (Doughnut Chart)
  const debtDoughnutData = {
    labels: ['I Owe', 'Owed To Me'],
    datasets: [
      {
        label: 'Debt Overview',
        data: [
          chartData?.debtBreakdown?.['I Owe'] || 0,
          chartData?.debtBreakdown?.['Owed To Me'] || 0
        ],
        backgroundColor: [
          theme.palette.error.main, // Red for I Owe
          theme.palette.success.main, // Green for Owed To Me
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
      },
    ],
  };
  const debtDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: theme.palette.text.primary } },
      title: { display: true, text: 'Debt Overview', color: theme.palette.text.primary },
    },
  };

  // 7. Savings Goal Progress (Bar Chart)
  const savingsBarData = {
    labels: chartData?.savingGoalProgress ? Object.keys(chartData.savingGoalProgress) : [],
    datasets: [
      {
        label: 'Current Saved',
        data: chartData?.savingGoalProgress ? Object.values(chartData.savingGoalProgress).map(goal => goal.current) : [],
        backgroundColor: theme.palette.secondary.main, // Teal
        borderColor: theme.palette.secondary.dark,
        borderWidth: 1,
      },
      {
        label: 'Target Amount',
        data: chartData?.savingGoalProgress ? Object.values(chartData.savingGoalProgress).map(goal => goal.target - goal.current) : [],
        backgroundColor: theme.palette.grey[700], // Grey for remaining
        borderColor: theme.palette.grey[800],
        borderWidth: 1,
      },
    ],
  };
  const savingsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: theme.palette.text.primary } },
      title: { display: true, text: 'Savings Goal Progress', color: theme.palette.text.primary },
    },
    scales: {
      x: {
        stacked: true, // Bars ko stack karein
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] },
      },
      y: {
        stacked: true, // Bars ko stack karein
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.grey[800] },
      },
    },
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!summaryData || !chartData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
          No data available for dashboard summary. Please add some financial entries.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Typography variant="h4" component="h1" gutterBottom className="dashboard-header">
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Net Worth</Typography>
              <Typography variant="h5">₹ {summaryData.netWorth?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'secondary.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Bank Balance</Typography>
              <Typography variant="h5">₹ {summaryData.totalBankBalance?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Investments</Typography>
              <Typography variant="h5">₹ {summaryData.totalInvestmentValue?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'success.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total FD Principal</Typography>
              <Typography variant="h5">₹ {summaryData.totalFDPrincipal?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'error.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Outstanding Loans</Typography>
              <Typography variant="h5">₹ {summaryData.totalOutstandingLoans?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'warning.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Monthly Expense</Typography>
              <Typography variant="h5">₹ {summaryData.totalMonthlyExpense?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: 'info.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Savings Goal Progress</Typography>
              <Typography variant="h5">
                ₹ {summaryData.totalSavingsCurrentSaved?.toLocaleString('en-IN') ?? 'N/A'} / ₹ {summaryData.totalSavingsTargetAmount?.toLocaleString('en-IN') ?? 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: theme.palette.grey[800], color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total I Owe</Typography>
              <Typography variant="h5">₹ {summaryData.totalIOwe?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: theme.palette.grey[700], color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Owed To Me</Typography>
              <Typography variant="h5">₹ {summaryData.totalOwedToMe?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} className="summary-card-item">
          <Card sx={{ bgcolor: theme.palette.grey[900], color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Monthly EMI Outflow</Typography>
              <Typography variant="h5">₹ {summaryData.totalMonthlyEmiOutflow?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Typography variant="h5" component="h2" gutterBottom className="charts-section-header">
        Financial Insights & Charts
      </Typography>
      <Grid container spacing={3}>
        {/* 1. Expense Category Breakdown (Doughnut Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {expenseDoughnutData.labels.length > 0 ? (
              <Doughnut data={expenseDoughnutData} options={expenseDoughnutOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No monthly expense data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 2. Investment Distribution (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {investmentBarData.labels.length > 0 ? (
              <Bar data={investmentBarData} options={investmentBarOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No investment data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 3. Bank Balance Distribution (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {bankBalanceBarData.labels.length > 0 ? (
              <Bar data={bankBalanceBarData} options={bankBalanceBarOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No bank account data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 4. Fixed Deposit Principal Distribution (Doughnut Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {fdDoughnutData.labels.length > 0 ? (
              <Doughnut data={fdDoughnutData} options={fdDoughnutOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No Fixed Deposit data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 5. Loan Outstanding by Type (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {loanBarData.labels.length > 0 ? (
              <Bar data={loanBarData} options={loanBarOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No loan data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 6. Debt Overview (Doughnut Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {debtDoughnutData.datasets[0].data[0] > 0 || debtDoughnutData.datasets[0].data[1] > 0 ? ( // Check if there's any debt data
              <Doughnut data={debtDoughnutData} options={debtDoughnutOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No debt data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 7. Savings Goal Progress (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="chart-paper">
            {savingsBarData.labels.length > 0 ? (
              <Bar data={savingsBarData} options={savingsBarOptions} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="h6" className="chart-placeholder-text">No savings goal data for chart.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Placeholder for Net Worth Over Time (Line Chart) - Future Enhancement */}
        <Grid item xs={12}>
          <Paper elevation={3} className="chart-paper" sx={{ height: 300 }}>
            <Typography variant="h6" className="chart-placeholder-text">
              Net Worth Over Time (Historical data needed for this chart - Future Feature)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;