
import React, { useState, useEffect } from 'react';
import Login from './Login';

import Header from './components/Header/Header';

import Cart from './Screens/Cart/Cart';
import ProductList from './Screens/ProductList/ProductList';
import Home from './Screens/Home/Home';

import './Styles/Main.css';
import { Routes, Route } from 'react-router-dom';

function App() {

    return (
        <div>
            <Header />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/products' element={<ProductList />} />
                <Route path='/cart' element={<Cart />} />
            </Routes>
        </div>
    );
}

export default App;