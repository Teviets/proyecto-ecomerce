import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import { Popper } from "@mui/material";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaCartPlus } from "react-icons/fa";

import { useAuth } from '../Auth/AuthContext.js';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function CustomDialog({ isLogin }) {
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, id } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogin = async () => {
        try {
          const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
      
          if (response.ok) {
            const data = await response.json();
            if (!data["order_id"]) {
              data["order_id"] = {
                order: ''
              };
            }
            
            login(data.user.username, data.user.id, data["order_id"]["order"]);
            handleClose();
            
          } else {
            const errorData = await response.json();
            alert(errorData.detail || "Login failed");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Network error. Please try again.");
        }
    };

    const handleRegister = async () => {
        try {
            const payload = {
                "email": username,
                "password": password,
            }
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                mode: "cors",
            });

            if (response.ok) {
                handleClose();
            } else {
                const errorData = await response.json();
                alert(errorData.detail || "Registration failed");
            }
            
    
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please try again.");
        }
    };
    

    return (
        <React.Fragment>
            {isLogin ? 
                <a className="nav-link btn" onClick={handleClickOpen}>Login</a>:
                <a className="nav-link btn btn-primary text-white" onClick={handleClickOpen}>Sign Up</a>
            }
        
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: 'black',
                        color: 'white',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>{isLogin ? 'Login' : 'Sign Up'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Email"
                        variant="outlined"
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        margin="dense"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'gray' },
                                '&:hover fieldset': { borderColor: 'white' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'gray',
                                '&.Mui-focused': { color: 'white' }
                            }
                        }}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        onChange={(e) => setPassword(e.target.value)}
                        margin="dense"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: 'gray' },
                                '&:hover fieldset': { borderColor: 'white' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'gray',
                                '&.Mui-focused': { color: 'white' }
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: 'white' }}>
                                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: 'white', bgcolor: 'gray', '&:hover': { bgcolor: 'darkgray' } }}>
                        Cancel
                    </Button>
                    <Button onClick={isLogin ? handleLogin: handleRegister} sx={{ color: 'black', bgcolor: 'white', '&:hover': { bgcolor: 'lightgray' } }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

const quantity = [
    1,2,3,4,5,6,7,8,9,10
];
export function CustomDialogAddToCart({ product }) {
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);


    const { isAuthenticated, id, orderID, login, updateOrderID } = useAuth();

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickOpen = async () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogin = async () => {
        try {
          const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log("data", data);
            if (!data["order_id"]) {
              data["order_id"] = {
                order: ''
              };
            }
            
            login(data.user.username, data.user.id, data["order_id"]["order"]);
            handleClose();

            console.log(orderID);
            console.log(data["order_id"]["order"]);
            
          } else {
            const errorData = await response.json();
            alert(errorData.detail || "Login failed");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Network error. Please try again.");
        }
    };

    const handleAddtoCart = async () => {
        product["quantity"] = selectedQuantity;

        const payload = {
            product_id: product,
            user_id: Number(id),
            order_id: orderID || null
        };

        // Verificar que el ID del producto, usuario y orden sean válidos
        if (typeof product.id !== 'number' || isNaN(product.id)) {
            alert("Invalid product_id");
            return;
        }
    
        if (isNaN(id) ) {
            alert("Invalid user_id");
            return;
        }
        
    
        try {
            const response = await fetch("http://localhost:8000/Cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                updateOrderID(data.order_id); // Actualiza el orderID en el contexto
                handleClose();
            } else {
                const errorData = await response.json();
                alert(errorData.detail || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please try again.");
        }
    };
    
    // Función para verificar si el order_id es un UUID válido
    function isValidUUID(uuid) {
        const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return regex.test(uuid);
    }
    

    return (
        <React.Fragment>
            <IconButton type="button" sx={{ p: '10px', color: 'white' }} aria-label="add to cart" onClick={handleClickOpen}>
                <FaCartPlus />
            </IconButton>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: 'black',
                        color: 'white',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>{isAuthenticated ? 'Your product was added to your cart': 'Please Login to add to cart'}</DialogTitle>
                <DialogContent>
                    {isAuthenticated ?(
                        <Autocomplete
                            disablePortal={false}
                            options={quantity}
                            onChange={(event, newValue) => {
                                setSelectedQuantity(newValue);
                            }}
                            PopperComponent={(props) => <Popper {...props} style={{ zIndex: 2000, width: '15%' }} />}
                            sx={{
                                width: 300,
                                "& .MuiAutocomplete-popupIndicator": {
                                    color: "white",
                                },
                                "& .MuiAutocomplete-clearIndicator": {
                                    color: "white",
                                },
                                "& .MuiAutocomplete-listbox": {
                                    bgcolor: "black",
                                },
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Quantity"
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            color: "white",
                                            "& fieldset": { borderColor: "gray" },
                                            "&:hover fieldset": { borderColor: "white" },
                                            "&.Mui-focused fieldset": { borderColor: "white" },
                                        },
                                        "& .MuiInputLabel-root": {
                                            color: "gray",
                                            "&.Mui-focused": { color: "white" },
                                        },
                                    }}
                                />
                            )}
                        />
                        ):(
                            
                            <>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    onChange={(e) => setUsername(e.target.value)}
                                    fullWidth
                                    margin="dense"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            '& fieldset': { borderColor: 'gray' },
                                            '&:hover fieldset': { borderColor: 'white' },
                                            '&.Mui-focused fieldset': { borderColor: 'white' },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'gray',
                                            '&.Mui-focused': { color: 'white' }
                                        }
                                    }}
                                />
                                <TextField
                                    label="Password"
                                    variant="outlined"
                                    type={showPassword ? "text" : "password"}
                                    fullWidth
                                    onChange={(e) => setPassword(e.target.value)}
                                    margin="dense"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            '& fieldset': { borderColor: 'gray' },
                                            '&:hover fieldset': { borderColor: 'white' },
                                            '&.Mui-focused fieldset': { borderColor: 'white' },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'gray',
                                            '&.Mui-focused': { color: 'white' }
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: 'white' }}>
                                                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </>
                        )
                    }
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: 'white', bgcolor: 'gray', '&:hover': { bgcolor: 'darkgray' } }}>
                        Cancel
                    </Button>
                    <Button onClick={isAuthenticated ? handleAddtoCart: handleLogin} sx={{ color: 'black', bgcolor: 'white', '&:hover': { bgcolor: 'lightgray' } }}>
                        {isAuthenticated ? 'Close': 'Login'}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

/*
export function CustomDialogFinishCheckOut({ handleFinishCheckout }) {
    const [open, setOpen] = React.useState(true);
    const [Message, setMessage] = React.useState("Your order has been placed successfully!");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const finish = async () => {
        try {
            handleFinishCheckout();
            handleClickOpen();
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please try again.");
        }
    };

    return (
        <React.Fragment>

            <Button 
                variant="contained" 
                onClick={handleFinishCheckout}
                size={isSmallScreen ? 'small' : 'medium'}
                fullWidth={isSmallScreen}
            >
                Finish Order
            </Button>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: 'black',
                        color: 'white',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>Finish Checkout</DialogTitle>
                <DialogContent>
                    {Message}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: 'white', bgcolor: 'gray', '&:hover': { bgcolor: 'darkgray' } }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
    */