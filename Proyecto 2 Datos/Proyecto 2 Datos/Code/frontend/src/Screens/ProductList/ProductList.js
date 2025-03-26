import React, { useEffect, useState } from 'react'
import './ProductList.css'

import { CiSearch } from "react-icons/ci";

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';


import CustomCard from '../../components/CustomCard/CustomCard.js'
import Filters from '../../components/Filters/Filters.js';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/products")
      .then(response => response.json())
      .then(data => setProducts(data));
  }
  , []);
  
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
            bgcolor: 'black', // Fondo oscuro
            color: 'white',   // Texto blanco
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, color: 'white' }} // Texto blanco en el input
            placeholder="Search Google Maps"
            inputProps={{ 'aria-label': 'search google maps' }}
          />
          <IconButton type="button" sx={{ p: '10px', color: 'white' }} aria-label="search">
            <CiSearch />
          </IconButton>
        </Paper>

        </div>
      </div>

      <div className='filter-bar'>
        <Filters/>
      </div>
      <div className='product-grid'>
        {products.map(product => (
          <CustomCard key={product.id} product={product}/>
        ))}
      </div>
    </div>
  )
}
