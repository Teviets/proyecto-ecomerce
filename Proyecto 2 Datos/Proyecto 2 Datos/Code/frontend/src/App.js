
import React, { useState, useEffect } from 'react';
import Login from './Login';

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

    // return (
    //     <div>
    //         <h1>Online Store</h1>
    //         {!loggedIn ? (
    //             <Login setLoggedIn={setLoggedIn} />
    //         ) : (
    //             <>
    //                 <select onChange={(e) => setSelectedCategory(e.target.value)}>
    //                     <option value="">All Categories</option>
    //                     {categories.map(category => (
    //                         <option key={category.id} value={category.id}>{category.name}</option>
    //                     ))}
    //                 </select>
    //                 <ul>
    //                     {products.filter(product => !selectedCategory || product.category_id == selectedCategory).map(product => (
    //                         <li key={product.id}>{product.name} - ${product.price}</li>
    //                     ))}
    //                 </ul>
    //             </>
    //         )}
    //     </div>
    // );
    return (
        <div>
            <h1>Online Store</h1>
            {!loggedIn ? (
                <Login setLoggedIn={setLoggedIn} />
            ) : (
                <>
                    <select onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {products
                            .filter(product => !selectedCategory || product.category_id == selectedCategory)
                            .map(product => (
                                <li key={product.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            style={{ width: '100px', height: '100px', marginRight: '10px', borderRadius: '5px' }}
                                        />
                                        <div>
                                            <h3>{product.name}</h3>
                                            <p>${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default App;