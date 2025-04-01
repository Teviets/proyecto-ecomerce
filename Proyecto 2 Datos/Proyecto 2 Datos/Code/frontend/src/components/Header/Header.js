import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth } from '../Auth/AuthContext';

import { Link } from 'react-router-dom';
import {CustomDialog} from '../Dialog/CustomDialog';

export default function Header() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <a className="navbar-brand" href="#">Online Store</a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/products">Products</Link>
                        </li>
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/cart">Cart</Link>
                            </li>
                        )}
                        
                    </ul>

                    <ul className="navbar-nav">
                    <ul className="navbar-nav">
                        {isAuthenticated ? (
                            <li className="nav-item">
                                <button className="btn btn-danger" onClick={logout}>
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <CustomDialog isLogin={true} />
                                </li>
                                <li className="nav-item">
                                    <CustomDialog isLogin={false} />
                                </li>
                            </>
                        )}
                    </ul>

                        
                    </ul>
                </div>
            </div>
        </nav>
  );
}
