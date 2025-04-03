import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // ¡IMPORTANTE! Esto arregla el menú
import { useAuth } from '../Auth/AuthContext';
import { Link } from 'react-router-dom';
import { CustomDialog } from '../Dialog/CustomDialog';
import './Header.css';

export default function Header() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Online Store</Link>
                
                {/* Botón del menú hamburguesa */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenido colapsable */}
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
                </div>
            </div>
        </nav>
    );
}