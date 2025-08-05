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
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For Completed badge
import AddCircleIcon from '@mui/icons-material/AddCircle'; // Add money icon
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AdbIcon from '@mui/icons-material/Adb';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import API from '../api.jsx';
import SavingGoalFormModal from '../components/SavingGoalFormModal.jsx';
import AddMoneyModal from '../components/AddMoneyModal.jsx';

import './SavingsGoals.css';

// Helper function to get category icon
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Travel': return <FlightTakeoffIcon />;
    case 'Gadget': return <AdbIcon />; // Placeholder icon, you can add this in the future
    case 'Emergency Fund': return <LocalHospitalIcon />;
    case 'Education': return <SchoolIcon />;
    case 'Car': return <DirectionsCarIcon />;
    case 'Home': return <HomeIcon />;
    default: return <MoreHorizIcon />;
  }
};

// Helper function to calculate required savings rate
const calculateRequiredRate = (amountRemaining, deadline) => {
   const validAmountRemaining = Math.max(0, parseFloat(amountRemaining || 0));

    if (validAmountRemaining === 0) {
        return 0; // Goal is met or exceeded
    }
    
    const now = new Date();
    const deadlineDate = new Date(deadline);

    // Set time to 0 to compare dates only
    now.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate <= now) {
        return validAmountRemaining; // If deadline is past, you need to save the whole amount now
    }
    
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30.44; // Average days in a month

    if (diffMonths <= 0) {
        return validAmountRemaining;
    }

    return validAmountRemaining / diffMonths; 
};


const calculateProjectedCompletion = (currentSaved, requiredMonthlyRate) => {
    return "N/A";
}

function SavingsGoals() {
  const [openGoalModal, setOpenGoalModal] = useState(false);
  const [openAddMoneyModal, setOpenAddMoneyModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentGoalToEdit, setCurrentGoalToEdit] = useState(null);
  const [goalToAddMoney, setGoalToAddMoney] = useState(null);

  // For Summary Dashboard
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalRequiredMonthly, setTotalRequiredMonthly] = useState(0);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/savinggoals');
      const fetchedGoals = res.data;

      // Calculate summary metrics
      let sumSaved = 0;
      let sumTarget = 0;
      let sumRequired = 0;
      
            fetchedGoals.forEach(goal => {
                if (goal.status === 'Active') {
                    const saved = goal.currentSaved || 0;
                    const target = goal.targetAmount || 0;

                    sumSaved += saved;
                    sumTarget += target;

                    const amountRemaining = target - saved;
                    // Directly add the numeric result of the calculation
                    sumRequired += calculateRequiredRate(amountRemaining, goal.deadline);
                }
            });

            setTotalSaved(sumSaved);
            setTotalTarget(sumTarget);
            setTotalRequiredMonthly(sumRequired); // Store as a number
            setGoals(fetchedGoals);

    } catch (err) {
      setError(err.response?.data?.message || 'Problem in feteching Goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAddGoalModal = () => {
    setCurrentGoalToEdit(null);
    setOpenGoalModal(true);
  };

  const handleOpenEditGoalModal = (goal) => {
    setCurrentGoalToEdit(goal);
    setOpenGoalModal(true);
  };

  const handleCloseGoalModal = () => {
    setOpenGoalModal(false);
    setCurrentGoalToEdit(null);
    fetchGoals();
  };

  const handleOpenAddMoneyModal = (goal) => {
    setGoalToAddMoney(goal);
    setOpenAddMoneyModal(true);
  };

  const handleCloseAddMoneyModal = () => {
    setOpenAddMoneyModal(false);
    setGoalToAddMoney(null);
    fetchGoals();
  };

  const handleGoalSaved = (savedGoal) => {
    // This is handled by fetchGoals()
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Do you really want to delete this Goal?')) {
      try {
        await API.delete(`/savinggoals/${id}`);
        fetchGoals();
      } catch (err) {
        setError(err.response?.data?.message || 'Problem in deleting this Goal.');
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

  const activeGoals = goals.filter(goal => goal.status === 'Active');
  const completedGoals = goals.filter(goal => goal.status === 'Completed');

  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;


  return (
   <Box className ="goals-page-wrapper">
    <Container maxWidth="lg" className="goals-container">
      <Box className="goals-header">
        <Typography variant="h4" component="h1">
          Savings Goals
        </Typography>
        {/* FAB at bottom right */}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Dashboard */}
      <Grid container spacing={2} className="goals-summary-dashboard">
        <Grid item xs={12} sm={6}>
          <Card className="goals-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Saved Across All Goals
              </Typography>
              <Typography variant="h5">
                ₹ {totalSaved.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card className="goals-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required Monthly Savings
              </Typography>
              <Typography variant="h5">
                ₹ {totalRequiredMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className="goals-summary-card1" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Overall Progress
            </Typography>

          {/* New Circular Progress Bar Structure */}
          <Box
           className="circular-progress-container"
           sx={{
           // Dynamically create the conic gradient based on progress
           background: `conic-gradient(#2196F3 ${totalProgress}%, #424242 ${totalProgress}%)`,
           }}
          >
          <Box className="circular-progress-inner-circle">
            <Typography className="progress-text-percent">
              {totalProgress.toFixed(0)}%
             </Typography>
            <Typography className="progress-text-label">
              Complete
            </Typography>
          </Box>
          </Box>
          </Card>
        </Grid>
      </Grid>


      {/* Your Active Goals */}
      <Typography variant="h4.5" component="h2" sx={{ mt: 3, mb: 2 }}>
        Your Active Goals
      </Typography>
      <Box className="goal-card-grid">
        {activeGoals.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5, width: '100%' }}>
            NO Active Goals detected. Add new Goal!
          </Typography>
        ) : (
          activeGoals.map(goal => {
              const target = goal.targetAmount || 0;
              const saved = goal.currentSaved || 0;
              const progressPercentage = target > 0 ? (saved / target) * 100 : 0;
              const amountRemaining = target - saved;
              const requiredMonthlyRate = calculateRequiredRate(amountRemaining, goal.deadline);
            return (
              <Card key={goal._id} className="goal-card">
                <Box className="goal-card-header">
                  <IconButton aria-label="edit" onClick={() => handleOpenEditGoalModal(goal)} sx={{ color: 'white', ml: 'auto', mr: -1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => handleDeleteGoal(goal._id)} sx={{ color: 'white', mr: -1 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ mr: 2, color: 'primary.main' }}>
                            {getCategoryIcon(goal.category)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" noWrap>{goal.goalName}</Typography>
                        </Box>
                    </Box>
                </Box>
                
                <Box className="goal-progress-bar-container">
                  <Box className="goal-progress-bar-fill" sx={{ width: `${progressPercentage}%` }} />
                </Box>
                <Box className="goal-info">
                  <Typography variant="body2">
                    ₹{saved.toLocaleString('en-IN')} / ₹{target.toLocaleString('en-IN')} saved
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Remaining: ₹{(amountRemaining ?? 0).toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Typography variant="body2" className="required-savings-rate">
                  You need to save ₹{requiredMonthlyRate.toLocaleString('en-IN')}/month
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className="add-money-button"
                  startIcon={<AddCircleIcon />}
                  onClick={() => handleOpenAddMoneyModal(goal)}
                >
                  Add Money
                </Button>
              </Card>
            );
          })
        )}
      </Box>

      {/* Completed Goals Section */}
      <Typography variant="h4.5" component="h2" className="completed-goals-section">
        Completed Goals
      </Typography>
      <Box className="goal-card-grid">
        {completedGoals.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 2, width: '100%' }}>
            No goal is completed Now!
          </Typography>
        ) : (
          completedGoals.map(goal => (
            <Card key={goal._id} className="goal-card completed-goal-card">
              <Box className="completed-badge">Completed!</Box>
              <CardContent>
                <Box className="goal-card-header">
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {getCategoryIcon(goal.category)}
                  </Box>
                  <Box>
                    <Typography variant="h6" noWrap sx={{ color: 'text.primary' }}>{goal.goalName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Completed on: {new Date(goal.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mt: 2, color: 'text.primary' }}>
                  Target: ₹{(goal.targetAmount ?? 0).toLocaleString('en-IN')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                  Saved: ₹{(goal.currentSaved ?? 0).toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>


      {/* Floating Action Button (FAB) for Add New Goal */}
      <Fab color="secondary" aria-label="add" className="fab-container" onClick={handleOpenAddGoalModal}>
        <AddIcon />
      </Fab>

      <SavingGoalFormModal
        open={openGoalModal}
        handleClose={handleCloseGoalModal}
        onGoalSaved={handleGoalSaved}
        currentGoal={currentGoalToEdit}
      />
      
      {goalToAddMoney && (
        <AddMoneyModal
          open={openAddMoneyModal}
          handleClose={handleCloseAddMoneyModal}
          onMoneyAdded={() => { /* Handled by fetchGoals() */ }}
          goalName={goalToAddMoney.goalName}
          goalId={goalToAddMoney._id}
          currentSaved={goalToAddMoney.currentSaved}
          targetAmount={goalToAddMoney.targetAmount}
        />
      )}
    </Container>
   </Box> 
  );
}

export default SavingsGoals;


