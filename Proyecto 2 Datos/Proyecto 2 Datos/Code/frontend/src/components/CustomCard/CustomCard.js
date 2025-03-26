import React from 'react'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';

import { FaCartPlus } from "react-icons/fa";

export default function CustomCard(key, product) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        title={product.name}
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="194"
        image={product.image_url}
        alt="Paella dish"
      />
      <CardContent>
        {product.price}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton type="button" sx={{ p: '10px', color: 'white' }} aria-label="search">
          <FaCartPlus />
        </IconButton>
      </CardActions>
      
    </Card>
  )
}
