import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import API from '../api.jsx';

function InvestmentFormModal({ open, handleClose , onInvestmentSaved , currentInvestment}){
    const [ stockName , setStockName] = useState(' ');
    const [ quantity , setQuantity] = useState(' ');
    const [ avgBuyPrice , setAvgBuyPrice] = useState(' ');
    const [ currentMarketPrice , setCurrentMarketPrice] = useState(' ');
    const [ purchaseDate, setPurchaseDate] = useState(' ');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(currentInvestment) {
            setStockName(currentInvestment.stockName || '');
            setQuantity(currentInvestment.quantity !== undefined ? currentInvestment.quantity.toString() : '');
            setAvgBuyPrice(currentInvestment.avgBuyPrice !== undefined ? currentInvestment.avgBuyPrice.toString() : '');
            setCurrentMarketPrice(currentInvestment.currentMarketPrice !== undefined ? currentInvestment.currentMarketPrice.toString() : '');
            setPurchaseDate(currentInvestment.purchaseDate ? new Date(currentInvestment.purchaseDate).toISOString().split('T')[0] : '');
        } else {
            //form reset 
            setStockName('');
            setQuantity('');
            setAvgBuyPrice('');
            setCurrentMarketPrice('');
            setPurchaseDate('');
        }
        setError(''); //modal khulne par error clear hoga 
      },[open, currentInvestment]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const investmentData = {
            stockName,
            quantity: parseFloat(quantity),
            avgBuyPrice: parseFloat(avgBuyPrice),
            currentMarketPrice: parseFloat(currentMarketPrice),
            purchaseDate: purchaseDate || undefined,
        };

        try{
            let res;
            if(currentInvestment){
                res = await API.put(`/investments/${currentInvestment._id}`, investmentData);
            } else {
                res =await API.post('/investments', investmentData);
            }
            onInvestmentSaved(res.data); //parent component ko updated data bhejna
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setLoading(false);
        }
      };

    return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentInvestment ? 'Edit Investment' : 'Add new Investment'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="stockName"
            label="Stock Name"
            type="text"
            fullWidth
            variant="outlined"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="avgBuyPrice"
            label="Average Buy Price"
            type="number"
            fullWidth
            variant="outlined"
            value={avgBuyPrice}
            onChange={(e) => setAvgBuyPrice(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="currentMarketPrice"
            label="Current Market Price (CMP)"
            type="number"
            fullWidth
            variant="outlined"
            value={currentMarketPrice}
            onChange={(e) => setCurrentMarketPrice(e.target.value)}
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            id="purchaseDate"
            label="Purchase Date"
            type="date" // Date input type
            fullWidth
            variant="outlined"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            InputLabelProps={{
              shrink: true, // Label ko hamesha upar rakhe date input ke liye
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (currentInvestment ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InvestmentFormModal;