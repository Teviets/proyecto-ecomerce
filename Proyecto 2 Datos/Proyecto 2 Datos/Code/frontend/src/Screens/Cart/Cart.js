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
import { useMediaQuery } from '@mui/material';
import './Cart.css';

import { MdDelete } from "react-icons/md";

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
  const [deletingIds, setDeletingIds] = useState([]);

  const isSmallScreen = useMediaQuery('(max-width:768px)');

  const { orderID } = useAuth();

  const handleDeleteItem = async (product_id) => {
    try {
      setDeletingIds(prev => [...prev, product_id]);
  
      const url = `http://localhost:8000/ItemCart?order_id=${orderID}&product_id=${product_id}`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || errorData.detail || 'Error al eliminar el producto');
      }
  
      setTimeout(() => {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== product_id));
        setDeletingIds(prev => prev.filter(id => id !== product_id));
  
        // 🔥 Recalcular totales localmente en lugar de hacer otra llamada a la API
        const updatedProducts = products.filter(product => product.id !== product_id);
        const newSubtotal = updatedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const newTax = newSubtotal * TAX_RATE;
        const newTotal = newSubtotal + newTax;
  
        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newTotal);
        setItemCount(updatedProducts.length);
        
      }, 300);
  
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }finally {
      fetchCartData();
    }
  };
  

  const handleFinishCheckout = async () => {
    try {
      // Confirmación antes de finalizar
      if (!window.confirm('¿Estás seguro de que deseas finalizar la orden?')) {
        return;
      }
  
      const response = await fetch(`http://localhost:8000/Cart?order_id=${orderID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al finalizar la orden');
      }
  
      const data = await response.json();
  
      // Resetear el estado del carrito
      setProducts([]);
      setSubtotal(0);
      setTax(0);
      setTotal(0);
      setItemCount(0);
  
      // Mostrar mensaje de éxito
      alert('Orden completada con éxito');
  
    } catch (error) {
      console.error('Error al finalizar la orden:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
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
      
      const productsData = data.products || [];
      const newSubtotal = data.total || 0;
      const newTax = newSubtotal * TAX_RATE;
      const newTotal = newSubtotal + newTax;
      
      setProducts(productsData);
      setSubtotal(newSubtotal);
      setTax(newTax);
      setTotal(newTotal);
      setItemCount(productsData.length);

    } catch (err) {
      console.error('Error fetching cart data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  // Corrige el useEffect para evitar bucles
  useEffect(() => {
    fetchCartData();
  }, [orderID]); 
  
  if (loading) return <div className="loading-message">Loading cart...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <div id='cart-container'>
        <div className="table-container">
          <TableContainer component={Paper}>
            <Table 
              sx={{ 
                minWidth: isSmallScreen ? 'auto' : 700,
                '& .MuiTableCell-root': {
                  padding: isSmallScreen ? '8px 4px' : '16px'
                }
              }} 
              aria-label="cart table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={isSmallScreen ? 3 : 5}>
                    Order Summary ({itemCount} items)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Product</TableCell>
                  {!isSmallScreen && (
                    <>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                    </>
                  )}
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  return (
                    <TableRow 
                      key={product.id} 
                      className={deletingIds.includes(product.id) ? 'deleting' : ''}
                    >
                      <TableCell component="th" scope="row">
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleDeleteItem(product.id)}
                          aria-label="Delete item"
                        >
                          <MdDelete className="delete-icon" />
                        </button>
                      </TableCell>
                      <TableCell>
                        {product.name}
                        {isSmallScreen && (
                          <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                            {product.quantity} × ${product.price.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      {!isSmallScreen && (
                        <>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                        </>
                      )}
                      <TableCell align="right">${product.summary.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={isSmallScreen ? 1 : 2} />
                  <TableCell colSpan={isSmallScreen ? 1 : 2}>Subtotal</TableCell>
                  <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={isSmallScreen ? 1 : 2} />
                  <TableCell colSpan={isSmallScreen ? 1 : 2}>
                    Tax ({TAX_RATE * 100}%)
                  </TableCell>
                  <TableCell align="right">${tax.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={isSmallScreen ? 1 : 2} />
                  <TableCell colSpan={isSmallScreen ? 1 : 2}>
                    <strong>Grand Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${total.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="checkout-button">
          <Button 
            variant="contained" 
            onClick={handleFinishCheckout}
            size={isSmallScreen ? 'small' : 'medium'}
            fullWidth={isSmallScreen}
          >
            Finish Order
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
}