import React, { useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import './Cart.css';

import { useAuth } from '../../components/Auth/AuthContext';

// Constantes mejor organizadas
const TAX_RATE = 0.12;
const DEFAULT_PRODUCT = { 
  producto: { 
    name: 'Producto no disponible', 
    price: 0 
  }, 
  cantidad: 0 
};

// Tema MUI (igual que tu versión)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#dcdcdc',
    },
    action: {
      hover: '#333333',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#333',
          color: '#fff',
        },
        body: {
          backgroundColor: '#1d1d1d',
          color: '#dcdcdc',
        },
      },
    },
  },
});

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0.0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const { orderID } = useAuth();
  
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        if (!orderID) {
          setError('No order ID available');
          return;
        }
  
        const response = await fetch(`http://localhost:8000/Cart?order_id=${orderID}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log(data);
        setProducts(data.products || []); // Ahora sí extrae el array correcto
        setSubtotal(data.total);
        console.log('Subtotal:', data.total);
        setTax(subtotal * TAX_RATE);
        console.log('Tax:', tax);
        console.log('Subtotal + Tax:', subtotal * TAX_RATE);
        setTotal(subtotal + tax);
        console.log('Total:', total);
      } catch (err) {
        console.error('Error fetching cart data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCartData();
  }, [orderID, subtotal, tax, total]);
  
  if (loading) return <div className="loading-message">Loading cart...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <div id='cart-container'>
        <div className="table-container">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="cart table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={4}>
                    Order Summary ({itemCount} items)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => {
                  const quantity = product.quantity || 0;
                  const summary = product.summary

                  return (
                    <TableRow key={`${product.name}-${index}`}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{quantity}</TableCell>
                      <TableCell align="right">{product.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{summary.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}


                <TableRow>
                  <TableCell rowSpan={3} />
                  <TableCell colSpan={2}>Subtotal</TableCell>
                  <TableCell align="right">{subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tax ({TAX_RATE * 100}%)</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right">{tax.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}><strong>Grand Total</strong></TableCell>
                  <TableCell align="right"><strong>{total.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="checkout-button">
          <Button variant="contained">Finish</Button>
        </div>
      </div>
    </ThemeProvider>
  );
}