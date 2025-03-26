import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import './Filters.css'

const optionsOrder = [
    { label: 'Name A-Z', value: 'name' },
    { label: 'Name Z-A', value: '-name' },
    { label: 'Price Low to High', value: 'price' },
    { label: 'Price High to Low', value: '-price' },
]

export default function Filters() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/categories")
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // mapear data para que categories tenga el formato label: 'name', value: 'id'
                const categories = data.map(category => {
                    return {
                        label: category.name,
                        value: category.id
                    }
                });
                setCategories(categories);
            });
    }
    , []);
  return (
    <div id='filters-container'>
        <Autocomplete
          disablePortal
          options={optionsOrder}
          sx={{ 
            width: 300,
            bgcolor: "black",
            color: "white",
            "& .MuiOutlinedInput-root": {
                color: "white", 
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" }
            },
            "& .MuiInputLabel-root": {
                color: "gray",
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
            },
            "& .MuiPaper-root": {
                bgcolor: "black",
                color: "white",
            }
          }}
          renderInput={(params) => (
            <TextField 
                {...params} 
                label="Order type" 
                variant="outlined" 
            />
          )}
        />

        <Autocomplete
          disablePortal
          options={categories}
          sx={{ 
            width: 300,
            bgcolor: "black",
            color: "white",
            "& .MuiOutlinedInput-root": {
                color: "white", 
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" }
            },
            "& .MuiInputLabel-root": {
                color: "gray",
            },
            "& .MuiInputLabel-root.Mui-focused": {
                color: "white",
            },
            "& .MuiPaper-root": {
                bgcolor: "black",
                color: "white",
            }
          }}
          renderInput={(params) => (
            <TextField 
                {...params} 
                label="Category" 
                variant="outlined" 
            />
          )}
        />
    </div>
  )
}
