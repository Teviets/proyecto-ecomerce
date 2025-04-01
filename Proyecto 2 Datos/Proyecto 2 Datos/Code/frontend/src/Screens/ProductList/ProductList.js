import React, { useEffect, useState } from 'react'
import './ProductList.css'

import { CiSearch } from "react-icons/ci";

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import CustomCard from '../../components/CustomCard/CustomCard.js'
import Filters from '../../components/Filters/Filters.js';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(null);
  const [order, setOrder] = useState(null);
  const [name, setName] = useState(null);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25); 

  useEffect(() => {
    let url = `http://localhost:8000/products?skip=${(page - 1) * limit}&limit=${limit}`;

    // Agregar filtros adicionales
    if (order) {
      url += `&order=${order}`;
    }
    if (category) {
      url += `&category=${category}`;
    }
    if (name) {
      url += `&name=${name}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setProducts(data.data);
        setTotal(Math.ceil(data.total / limit)); // Total de páginas basado en el número total de productos
      });
  }, [page, order, category, name, limit, page]);

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
              width: 400, 
              bgcolor: 'black',
              color: 'white',
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, color: 'white' }}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search google maps' }}
            />
            <IconButton type="button" sx={{ p: '10px', color: 'white' }} aria-label="search">
              <CiSearch />
            </IconButton>
          </Paper>
        </div>
      </div>

      <div className='filter-bar'>
        <Filters setOrder={setOrder} setCategory={setCategory} />
      </div>
      <div className='product-grid'>
        {products.map(product => (
          <CustomCard key={product.id} product={product}/>
        ))}
      </div>
      <div className='pagination'>
      <Stack spacing={2} sx={{ bgcolor: 'black', padding: 2, borderRadius: '10px' }}>
        <Pagination 
          count={total} 
          page={page}
          onChange={handleChangePage}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'white', // Cambia el color de los números
            },
            '& .Mui-selected': {
              backgroundColor: 'gray', // Cambia el color de fondo del elemento seleccionado
              color: 'white', // Cambia el color del texto del seleccionado
            },
            '& .MuiPaginationItem-ellipsis': {
              color: 'white', // Cambia el color de las elipsis
            },
          }}
        />
      </Stack>

      </div>
      
    </div>
  )
}
