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
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

/**
 * Proveedor de autenticación
 * @param {object} children - Componentes hijos
 * @returns {object} - Proveedor de autenticación
 */
export function AuthProvider({ children }) {
    const [email, setEmail] = useState(getCookie('email') || ''); // Estado para el email
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verifica si hay una cookie de email al cargar
        const storedEmail = getCookie('email');
        
        if (storedEmail) {
            setEmail(storedEmail);
            setIsAuthenticated(true);
        }
    }, []);

    /**
     * Función para iniciar sesión
     * @param {string} userEmail - Email del usuario
     */
    const login = (userEmail) => {
        // Establece una cookie con expiración en 1 mes
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // Establece la fecha de expiración a 1 mes
        document.cookie = `email=${userEmail}; expires=${expiryDate.toUTCString()}; path=/`; // Establece la cookie

        setEmail(userEmail);
        setIsAuthenticated(true);
    };

    /**
     * Función para cerrar sesión
     */
    const logout = () => {
        // Elimina la cookie y los datos de sesión
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; // Elimina la cookie
        setEmail('');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, email, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
