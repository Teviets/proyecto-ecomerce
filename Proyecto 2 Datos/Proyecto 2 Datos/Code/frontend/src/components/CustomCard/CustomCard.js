import React from 'react'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';

import { FaCartPlus } from "react-icons/fa";

export default function CustomCard({ product }) { // Corregí el parámetro para usar destructuración
  return (
    <Card sx={{ bgcolor: 'black', color: 'white', borderRadius: '10px' }}>
      <CardHeader
        title={product.name}
        sx={{ color: 'white' }} // Cambia el color del título a blanco
      />
      <CardMedia
        component="img"
        height="194"
        image={product.image_url} // Asegúrate de que la URL sea válida
        alt={product.name} // Agrega un texto alternativo para mejorar la accesibilidad
        sx={{ borderRadius: '8px' }} // Agrega un borde redondeado para las imágenes
      />
      <CardContent sx={{ color: 'white' }}>
        <p>{product.price}</p> {/* Asegúrate de que el precio esté en un elemento adecuado */}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton type="button" sx={{ p: '10px', color: 'white' }} aria-label="add to cart">
          <FaCartPlus />
        </IconButton>
      </CardActions>
    </Card>
  )
}
