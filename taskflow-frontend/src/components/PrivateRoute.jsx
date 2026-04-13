import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  
  // If no token exists, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, render the requested component
  return children;
}
