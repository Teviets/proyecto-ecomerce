
import React, { useState, useEffect } from 'react';
import Login from './Login';

import Header from './components/Header/Header';

import Cart from './Screens/Cart/Cart';
import ProductList from './Screens/ProductList/ProductList';
import Home from './Screens/Home/Home';

import './Styles/Main.css';
import { Routes, Route } from 'react-router-dom';

function App() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8000/products")
            .then(response => response.json())
            .then(data => setProducts(data));

        fetch("http://localhost:8000/categories")
            .then(response => response.json())
            .then(data => setCategories(data));
    }, []);

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