/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from local storage so the user stays logged in if they refresh
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // Listen to token changes, decode the JWT, and populate user context
  useEffect(() => {
    if (token) {
      try {
        const payloadStr = atob(token.split(".")[1]);
        const payload = JSON.parse(payloadStr);

        // Map ASP.NET Core Claims to simplified properties
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
        const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email;
        const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.nameid;

        setUser({
          ...payload,
          id,
          email,
          role
        });
      } catch (error) {
        console.error("Invalid token format", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Login function to save the token
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Logout function to clear everything
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
