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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InvestmentFormModal from '../components/InvestmentFormModal.jsx';
import API from '../api.jsx';

import './Investments.css';

function Investment() {
    const [openModal, setOpenModal] = useState(false);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentInvestmentToEdit, setCurrentInvestmentToEdit] = useState(null);

    const fetchInvestments = async () => {
        setLoading(true);
        setError('');
        try{
            const res = await API.get('/investments');
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

    const handleDeleteInvestment = async (id) => {
        if (window.confirm('Do you really want to delete this investment?')) {
            try{
                await API.delete(`/investments/${id}`);
                setInvestments((prevInvestments) => prevInvestments.filter((inv) => inv._id != id));
            } catch (err) {
                setError(err.response?.data?.message || 'Problem in deleting investment!');
            }
        }
    };

    //helper function to calculate other values..
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="investments-container"> {/* Class added */}
      <Box className="investments-header"> {/* Class added */}
        <Typography variant="h4" component="h1" className="investments-title"> {/* Class added */}
          Stock Investments
        </Typography>
        {/* Prototype ke Top Right Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}> {/* Use MUI Box for gap */}
            {/* <Button variant="outlined" color="primary" sx={{ textTransform: 'none', borderRadius: '8px' }}>
                Remove
            </Button>
            <Button variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: '8px' }}>
                <DeleteIcon sx={{ mr: 0.5 }} /> Remove
            </Button> */}
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenAddModal} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                Add New Investment
            </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {investments.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
          No investment added. Add investment!
        </Typography>
      ) : (
        <Paper elevation={3} className="investments-table-paper">
          <TableContainer>
            <Table className="investments-table" aria-label="investment table">
              <TableHead className="investments-table-head">
                {/* <-- Yahan dhyan dein: TableHead aur TableRow ke beech koi whitespace nahi */}
                <TableRow> {/* TableRow को TableHead के तुरंत बाद शुरू करें */}
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
                    // <-- Yahan dhyan dein: TableRow aur TableCell ke beech koi whitespace nahi
                    <TableRow
                      key={investment._id}
                      className="investments-table-row"
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" className="investments-table-cell">{investment.stockName}</TableCell> {/* TableCell को TableRow के तुरंत बाद */}
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
                        className={`investments-table-cell ${metrics.isProfit ? 'text-profit' : 'text-loss'}`}
                      >
                        {metrics.plPercentage}%
                      </TableCell>
                      <TableCell align="center" className="investments-table-cell investments-action-buttons">
                        <IconButton aria-label="edit" onClick={() => handleOpenEditModal(investment)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleDeleteInvestment(investment._id)}>
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

      <InvestmentFormModal
        open={openModal}
        handleClose={handleCloseModal}
        onInvestmentSaved={handleInvestmentSaved}
        currentInvestment={currentInvestmentToEdit}
      />
    </Container>
  );
}

export default Investment;
