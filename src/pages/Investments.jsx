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
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InvestmentFormModal from '../components/InvestmentFormModal.jsx';
import API from '../api.jsx';

import './Investments.css'; // Import the Investments CSS file

// Helper function to calculate investment metrics
const calculateInvestmentMetrics = (investment) => {
  const totalInvestment = investment.quantity * investment.avgBuyPrice;
  const currentValue = investment.quantity * investment.currentMarketPrice;
  const unrealizedPL = currentValue - totalInvestment;
  const plPercentage = totalInvestment !== 0 ? (unrealizedPL / totalInvestment) * 100 : 0;

  return {
    totalInvestment: totalInvestment.toFixed(2),
    currentValue: currentValue.toFixed(2),
    unrealizedPL: unrealizedPL.toFixed(2),
    plPercentage: plPercentage.toFixed(2),
    isProfit: unrealizedPL >= 0 // Profit ya Loss ke liye color
  };
};

// Custom confirmation dialog component (replaces window.confirm)
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


function Investment() {
  const [openModal, setOpenModal] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentInvestmentToEdit, setCurrentInvestmentToEdit] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);


  const fetchInvestments = async () => {
    setLoading(true);
    setError('');
    try{
      const res = await API.get('/investments'); // Using the imported API
      setInvestments(res.data);
    }catch(err) {
      setError(err.response?.data?.message || 'Problem in fetching Investment');
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  },[]);

  const handleOpenAddModal = () => {
    setCurrentInvestmentToEdit(null);
    setOpenModal(true);
  };

  const handleOpenEditModal = (investment) => {
    setCurrentInvestmentToEdit(investment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentInvestmentToEdit(null);
  };

  const handleInvestmentSaved = (savedInvestment) => {
    if(currentInvestmentToEdit){
      setInvestments((prevInvestments) =>
        prevInvestments.map((inv) =>
          inv._id === savedInvestment._id ? savedInvestment : inv
        )
      );
    } else {
      setInvestments((prevInvestments) => [...prevInvestments, savedInvestment]);
    }
  };

  const confirmDelete = (id) => {
    setInvestmentToDelete(id);
    setOpenConfirmDialog(true);
  };

  const handleDeleteInvestment = async () => {
    if (!investmentToDelete) return;

    try{
      await API.delete(`/investments/${investmentToDelete}`); // Using the imported API
      setInvestments((prevInvestments) => prevInvestments.filter((inv) => inv._id !== investmentToDelete));
      setOpenConfirmDialog(false);
      setInvestmentToDelete(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Problem in deleting investment!');
      setOpenConfirmDialog(false);
      setInvestmentToDelete(null);
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
    <Box className="investments-page-wrapper">
      <Container maxWidth="lg" className="investments-container"> {/* Class added */}
        <Box className="investments-header"> {/* Class added */}
          <Typography variant="h4" component="h1" className="investments-title"> {/* Class added */}
            Stock Investments
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}> {/* Use MUI Box for gap */}
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenAddModal} sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Add New Investment
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && investments.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
            No investment added. Add investment!
          </Typography>
        ) : (
          <Paper elevation={3} className="investments-table-paper">
            <TableContainer>
              <Table className="investments-table" aria-label="investment table">
                <TableHead className="investments-table-head">
                  <TableRow>
                    <TableCell>Stock Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg. Buy Price</TableCell>
                    <TableCell align="right">CMP</TableCell>
                    <TableCell align="right">Total Investment</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Unrealized P/L</TableCell>
                    <TableCell align="right">P/L %</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((investment) => {
                    const metrics = calculateInvestmentMetrics(investment);
                    return (
                      <TableRow
                        key={investment._id}
                        className="investments-table-row"
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row" className="investments-table-cell">{investment.stockName}</TableCell>
                        <TableCell align="right" className="investments-table-cell">{investment.quantity}</TableCell>
                        <TableCell align="right" className="investments-table-cell">{investment.avgBuyPrice.toFixed(2)}</TableCell>
                        <TableCell align="right" className="investments-table-cell">{investment.currentMarketPrice.toFixed(2)}</TableCell>
                        <TableCell align="right" className="investments-table-cell">{metrics.totalInvestment}</TableCell>
                        <TableCell align="right" className="investments-table-cell">{metrics.currentValue}</TableCell>
                        <TableCell
                          align="right"
                          className={`investments-table-cell ${metrics.isProfit ? 'text-profit' : 'text-loss'}`}
                        >
                          {metrics.unrealizedPL}
                        </TableCell>
                        <TableCell
                          align="right"
                          // P/L % column will use text-profit/text-loss classes
                          className={`investments-table-cell ${metrics.isProfit ? 'text-profit' : 'text-loss'}`}
                        >
                          {metrics.plPercentage}%
                        </TableCell>
                        <TableCell align="center" className="investments-table-cell investments-action-buttons">
                          {/* Edit Button with all styles in sx prop and !important */}
                          <Button
                            variant="contained"
                            onClick={() => handleOpenEditModal(investment)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontWeight: 600,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease-in-out',
                              backgroundColor: '#FFEB3B !important', // Light yellow with !important
                              color: '#333 !important', // Dark text for readability with !important
                              '&:hover': {
                                backgroundColor: '#FDD835 !important', // Slightly darker yellow on hover with !important
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              },
                            }}
                          >
                            Edit
                          </Button>
                          {/* Delete Button with all styles in sx prop and !important */}
                          <Button
                            variant="contained"
                            onClick={() => confirmDelete(investment._id)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontWeight: 600,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease-in-out',
                              backgroundColor: '#ef4444 !important', // Red with !important
                              color: 'white !important', // White text with !important
                              '&:hover': {
                                backgroundColor: '#dc2626 !important', // Darker red on hover with !important
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <InvestmentFormModal
          open={openModal}
          handleClose={handleCloseModal}
          onInvestmentSaved={handleInvestmentSaved}
          currentInvestment={currentInvestmentToEdit}
        />

        <CustomConfirmDialog
          open={openConfirmDialog}
          title="Confirm Deletion"
          message="Are you sure you want to delete this investment? This action cannot be undone."
          onConfirm={handleDeleteInvestment}
          onCancel={() => setOpenConfirmDialog(false)}
        />
      </Container>
    </Box>
  );
}

export default Investment;
