import React, { useEffect, useState } from 'react'
import './ProductList.css'

import { CiSearch } from "react-icons/ci";

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { CustomCard } from '../../components/CustomCard/CustomCard.js'
import Filters from '../../components/Filters/Filters.js';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(null);
  const [order, setOrder] = useState(null);
  const [name, setName] = useState(null);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let url = `http://localhost:8000/products?page=${page - 1}&limit=${limit}`;
  
    if (order) url += `&order=${order}`;
    if (category) url += `&category=${category}`;
    if (name) url += `&name=${name}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setProducts(data.data);
        setTotal(Math.ceil(data.total / limit));
      });
  }, [page, order, category, name, limit]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  return (
    <div id='product-list-container'>
      <div className="search-bar">
        <div className="input-group" id='search-bar'>
          <Paper
            component="form"
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              maxWidth: 400,
              bgcolor: 'black',
              color: 'white',
            }}
          >
            <InputBase
              sx={{ 
                ml: 1, 
                flex: 1, 
                color: 'white',
                fontSize: isSmallScreen ? '0.9rem' : '1rem'
              }}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search products' }}
            />
            <IconButton 
              type="button" 
              sx={{ 
                p: '10px', 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }} 
              aria-label="search"
            >
              <CiSearch size={isSmallScreen ? 18 : 24} />
            </IconButton>
          </Paper>
        </div>
      </div>

      <div className='filter-bar'>
        <Filters setOrder={setOrder} setCategory={setCategory} isMobile={isSmallScreen} />
      </div>
      
      <div className='product-grid'>
        {products.map(product => (
          <CustomCard 
            key={product.id} 
            product={product}
            compact={isMediumScreen}
          />
        ))}
      </div>
      
      <div className='pagination'>
        <Stack 
          spacing={2} 
          sx={{ 
            bgcolor: 'black', 
            padding: 2, 
            borderRadius: '10px',
            width: '100%',
            maxWidth: isSmallScreen ? '95%' : 'auto'
          }}
        >
          <Pagination 
            count={total} 
            page={page}
            onChange={handleChangePage}
            size={isSmallScreen ? 'small' : 'medium'}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
              },
              '& .Mui-selected': {
                backgroundColor: 'gray',
                color: 'white',
              },
              '& .MuiPaginationItem-ellipsis': {
                color: 'white',
              },
            }}
          />
        </Stack>
      </div>
    </div>
  )
}