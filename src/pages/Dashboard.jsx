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
import { useInView } from 'react-intersection-observer';

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
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
//Imported PolarArea and Pie
import { PolarArea, Line, Radar, Bar, Doughnut } from 'react-chartjs-2'; // <-- CHANGE: Replaced Pie with Radar

// Chart.js ko register karein
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  PointElement,
  LineElement,
  RadialLinearScale, // For PolarArea Chart
  Filler
);

import './Dashboard.css'; // <-- CSS file import

import dashboardBannerUrl from '/images/Dashboard.png'; 

//Helper component to apply scroll animation
const AnimatedGridItem = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  return (
    <Grid item xs={12} md={6} ref={ref} className={`chart-grid-item ${inView ? 'is-visible' : ''}`} sx={{ transitionDelay: `${delay}s` }}>
      {children}
    </Grid>
  );
};

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
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || 'Dashboard data fetch karne mein dikkat hui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Chart Data Definitions ---

  // 1. Expense Category Breakdown (Polar Area Chart)
  const expensePolarData = {
    labels: chartData?.expenseCategoryBreakdown ? Object.keys(chartData.expenseCategoryBreakdown) : [],
    datasets: [
      {
        label: 'Monthly Expense',
        data: chartData?.expenseCategoryBreakdown ? Object.values(chartData.expenseCategoryBreakdown) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const expensePolarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: 'white' } },
      title: { display: true, text: 'Monthly Expense Breakdown', color: 'white', font: { size: 16 } },
    },
    scales: { r: { ticks: { backdropColor: 'transparent', color: theme.palette.text.secondary } } },
  };

  // 2. Investment Distribution (Line Chart)
  const investmentLineData = {
    labels: chartData?.investmentDistribution ? Object.keys(chartData.investmentDistribution) : [],
    datasets: [
      {
        label: 'Current Value',
        data: chartData?.investmentDistribution ? Object.values(chartData.investmentDistribution) : [],
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      },
    ],
  };
  const investmentLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Investments by Value', color: 'white', font: { size: 16 } },
    },
    scales: {
      x: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
      y: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
    },
  };

  // 3. Bank Balance Distribution (Bar Chart - Unchanged)
  const bankBalanceBarData = {
    labels: chartData?.bankBalanceDistribution ? Object.keys(chartData.bankBalanceDistribution) : [],
    datasets: [{
      label: 'Balance',
      data: chartData?.bankBalanceDistribution ? Object.values(chartData.bankBalanceDistribution) : [],
      backgroundColor: theme.palette.info.main,
    }],
  };
  const bankBalanceBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bank Balances', color: 'white', font: { size: 16 } },
    },
    scales: {
      x: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
      y: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
    },
  };

  // 4. Fixed Deposit Principal Distribution (Radar Chart) // <-- CHANGE: Switched from Pie to Radar
  const fdRadarData = {
    labels: chartData?.fdPrincipalDistribution ? Object.keys(chartData.fdPrincipalDistribution) : [],
    datasets: [{
      label: 'Principal Amount',
      data: chartData?.fdPrincipalDistribution ? Object.values(chartData.fdPrincipalDistribution) : [],
      backgroundColor: 'rgba(46, 204, 113, 0.2)', // A nice green with transparency
      borderColor: theme.palette.success.main, // Solid green line
      borderWidth: 2,
      pointBackgroundColor: theme.palette.success.main,
      pointBorderColor: '#fff',
    }],
  };
  const fdRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hiding legend as there's only one dataset
      title: { display: true, text: 'FD Principal Distribution', color: 'white', font: { size: 16 } },
    },
    scales: {
      r: {
        angleLines: { color: 'white' },
        grid: { color: theme.palette.grey[800] },
        pointLabels: { color: 'white', font: { size: 12 } },
        ticks: {
          backdropColor: 'transparent',
          color: theme.palette.text.secondary,
        },
      },
    },
  };


  // 5. Loan Outstanding by Type (Smooth Line Chart)
  const loanLineData = {
    labels: chartData?.loanTypeOutstanding ? Object.keys(chartData.loanTypeOutstanding) : [],
    datasets: [{
      label: 'Remaining Amount',
      data: chartData?.loanTypeOutstanding ? Object.values(chartData.loanTypeOutstanding) : [],
      fill: true,
      backgroundColor: 'rgba(239, 83, 80, 0.2)',
      borderColor: theme.palette.error.main,
      tension: 0.4,
    }],
  };
  const loanLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Loans Outstanding by Type', color: 'white' , font: { size: 16 } },
    },
    scales: {
      x: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
      y: { ticks: { color: 'white' }, grid: { color: theme.palette.grey[800] } },
    },
  };

  // Other charts remain unchanged
  const debtDoughnutData = {
    labels: ['I Owe', 'Owed To Me'],
    datasets: [{
      label: 'Debt Overview',
      data: [chartData?.debtBreakdown?.['I Owe'] || 0, chartData?.debtBreakdown?.['Owed To Me'] || 0],
      backgroundColor: [theme.palette.error.main, theme.palette.success.main],
      borderColor: theme.palette.background.paper, borderWidth: 1,
    }],
  };
  const debtDoughnutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: 'white' } }, title: { display: true, text: 'Debt Overview', color: 'white', font: { size: 16 } } },
  };

  const savingsBarData = {
    labels: chartData?.savingGoalProgress ? Object.keys(chartData.savingGoalProgress) : [],
    datasets: [
      { label: 'Current Saved', data: chartData?.savingGoalProgress ? Object.values(chartData.savingGoalProgress).map(goal => goal.current) : [], backgroundColor: theme.palette.secondary.main },
      { label: 'Target Amount', data: chartData?.savingGoalProgress ? Object.values(chartData.savingGoalProgress).map(goal => goal.target - goal.current) : [], backgroundColor: theme.palette.grey[700] },
    ],
  };
  const savingsBarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: theme.palette.text.primary } }, title: { display: true, text: 'Savings Goal Progress', color: theme.palette.text.primary, font: { size: 16 } } },
    scales: { x: { stacked: true, ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } }, y: { stacked: true, ticks: { color: theme.palette.text.secondary }, grid: { color: theme.palette.grey[800] } } },
  };


  if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }
  if (error) { return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>; }
  if (!summaryData || !chartData) { return <Container maxWidth="md" sx={{ mt: 4 }}><Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>No data available.</Typography></Container>; }

  return (
    <Box className="dashboard-container">
      <Container maxWidth="lg" disableGutters sx={{ py: 3 }}>
        <Box className="dashboard-banner-container">
          <img src={dashboardBannerUrl} alt="Dashboard Banner" className="dashboard-banner" />
        </Box>

      {/*  Added Intro Paragraph Box */}
        <Box className="intro-paragraph-box">
          <Typography variant="h6" component="h2" className="intro-heading">
            Your Financial Command Center
          </Typography>
          <Typography variant="body1" className="intro-text">
            Welcome to the complete picture. Every transaction, investment, and goal, unified and simplified. </Typography>
           <Typography variant="body1" className="intro-text"> 🕵️‍♂️See Everything: Your real-time financial snapshot.</Typography>
           <Typography variant="body1" className="intro-text">📈Track What Matters: Monitor your growth with intelligent visuals.</Typography>
           <Typography variant="body1" className="intro-text">🧠Act with Insight: Turn complex data into smart, simple moves.</Typography> 
           <Typography variant="body1" className="intro-text">❤️This is your financial story, told with precision and style.</Typography> 
        </Box>

      <Typography variant="h4" component="h1" gutterBottom className="dashboard-header">
        Dashboard Overview
      </Typography>

      {/* Added sx prop for staggered animation delay*/}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} className="summary-card-item" sx={{ '--animation-delay': '0.1s' }}>
            <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Net Worth</Typography>
                <Typography variant="h5">₹ {summaryData.netWorth?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} className="summary-card-item" sx={{ '--animation-delay': '0.2s' }}>
            <Card sx={{ bgcolor: 'info.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Savings Goal Progress</Typography>
                <Typography variant="h5">
                  ₹ {summaryData.totalSavingsCurrentSaved?.toLocaleString('en-IN') ?? 'N/A'} / ₹ {summaryData.totalSavingsTargetAmount?.toLocaleString('en-IN') ?? 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} className="summary-card-item" sx={{ '--animation-delay': '0.3s' }}>
            <Card sx={{ bgcolor: theme.palette.grey[900], color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Total Monthly EMI Outflow</Typography>
                <Typography variant="h5">₹ {summaryData.totalMonthlyEmiOutflow?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


      <Grid container spacing={4}>
        <AnimatedGridItem>
          <Box className="chart-container">
            <Card className="chart-summary-card" sx={{ bgcolor: 'warning.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Monthly Expense</Typography>
                <Typography variant="h5">₹ {summaryData.totalMonthlyExpense?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
            <Paper elevation={3} className="chart-paper">
              {expensePolarData.labels.length > 0 ? (
                <PolarArea data={expensePolarData} options={expensePolarOptions} />
              ) : <Typography className="chart-placeholder-text">No expense data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>
        
        

        <AnimatedGridItem dealy={0.2}> 
           <Box className="chart-container">
            <Card className="chart-summary-card" sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Investments</Typography>
                <Typography variant="h5">₹ {summaryData.totalInvestmentValue?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
            <Paper elevation={3} className="chart-paper">
              {investmentLineData.labels.length > 0 ? (
                <Line data={investmentLineData} options={investmentLineOptions} />
              ) : <Typography className="chart-placeholder-text">No investment data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>

        <AnimatedGridItem>
           <Box className="chart-container">
            <Card className="chart-summary-card" sx={{ bgcolor: 'secondary.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Bank Balance</Typography>
                <Typography variant="h5">₹ {summaryData.totalBankBalance?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
            <Paper elevation={3} className="chart-paper">
              {bankBalanceBarData.labels.length > 0 ? (
                <Bar data={bankBalanceBarData} options={bankBalanceBarOptions} />
              ) : <Typography className="chart-placeholder-text">No bank data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>

        {/* FD Chart now renders a Radar chart */}
        <AnimatedGridItem delay={0.2}>
           <Box className="chart-container">
            <Card className="chart-summary-card" sx={{ bgcolor: 'success.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total FD Principal</Typography>
                <Typography variant="h5">₹ {summaryData.totalFDPrincipal?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
            <Paper elevation={3} className="chart-paper">
              {fdRadarData.labels.length > 0 ? (
                <Radar data={fdRadarData} options={fdRadarOptions} />
              ) : <Typography className="chart-placeholder-text">No FD data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>

        <AnimatedGridItem>
          <Box className="chart-container">
            <Card className="chart-summary-card" sx={{ bgcolor: 'error.dark', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Outstanding Loans</Typography>
                <Typography variant="h5">₹ {summaryData.totalOutstandingLoans?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
            <Paper elevation={3} className="chart-paper">
              {loanLineData.labels.length > 0 ? (
                <Line data={loanLineData} options={loanLineOptions} />
              ) : <Typography className="chart-placeholder-text">No loan data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>

        <AnimatedGridItem delay={0.2}>
           <Box className="chart-container">
            <Box sx={{ display: 'flex', width: '90%', justifyContent: 'space-between', position: 'absolute', top: '-50px' }}>
                <Card className="chart-summary-card-small" sx={{ bgcolor: theme.palette.grey[800], color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6">Total I Owe</Typography>
                        <Typography variant="h5">₹ {summaryData.totalIOwe?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
                    </CardContent>
                </Card>
                <Card className="chart-summary-card-small" sx={{ bgcolor: theme.palette.grey[700], color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6">Total Owed To Me</Typography>
                        <Typography variant="h5">₹ {summaryData.totalOwedToMe?.toLocaleString('en-IN') ?? 'N/A'}</Typography>
                    </CardContent>
                </Card>
            </Box>
            <Paper elevation={3} className="chart-paper">
              {debtDoughnutData.datasets[0].data[0] > 0 || debtDoughnutData.datasets[0].data[1] > 0 ? (
                <Doughnut data={debtDoughnutData} options={debtDoughnutOptions} />
              ) : <Typography className="chart-placeholder-text">No debt data.</Typography>}
            </Paper>
          </Box>
        </AnimatedGridItem>
      </Grid>
    </Container>
   </Box> 
  );
}

export default Dashboard;