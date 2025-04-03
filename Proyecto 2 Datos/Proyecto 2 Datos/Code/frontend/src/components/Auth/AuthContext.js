import { createContext, useContext, useState, useEffect } from 'react';

// Crea el contexto de autenticación
const AuthContext = createContext();

/**
 * Hook para obtener el contexto de autenticación
 * @returns {object} - Contexto de autenticación
 */
export function useAuth() {
    return useContext(AuthContext);
}

/**
 * Función para leer cookies por nombre
 * @param {string} name - El nombre de la cookie
 * @returns {string} - El valor de la cookie
 */
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return '';
}


/**
 * Proveedor de autenticación
 * @param {object} children - Componentes hijos
 * @returns {object} - Proveedor de autenticación
 */
export function AuthProvider({ children }) {
    const [email, setEmail] = useState(getCookie('email') || ''); // Estado para el email
    const [id, setID] = useState(getCookie('id') || ''); // Estado para el id
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [orderID, setOrderID] = useState(getCookie('orderID') || ''); // Estado para el orderID

    useEffect(() => {
        const storedEmail = getCookie('email');
        const storedID = getCookie('id');
        const stored = getCookie('orderID');
    
        if (storedEmail && storedID && stored) {
            setEmail(storedEmail);
            setID(storedID);
            setOrderID(stored);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);
    

    const login = (userEmail, userId, order_id) => {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      
        document.cookie = `email=${userEmail}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `id=${userId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        document.cookie = `orderID=${order_id}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
        setEmail(userEmail);
        setID(userId);
        setOrderID(order_id);
        setIsAuthenticated(true);
    };
    
    const logout = () => {
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'orderID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    
        setEmail('');
        setID('');
        setOrderID('');
        setIsAuthenticated(false);
    };

    const updateOrderID = (orderID) => {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      
        setOrderID(orderID);
        document.cookie = `orderID=${orderID}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }
    

    return (
        <AuthContext.Provider 
          value={{ 
            isAuthenticated, 
            email, 
            id, 
            orderID,
            login, 
            logout,
            updateOrderID
          }}
        >
          {children}
        </AuthContext.Provider>
      );
}
