/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = jwtDecode(token);

      if (payload.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      const role =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload.role;

      const email =
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        payload.email;

      const id =
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload.nameid;

      const name =
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        payload.unique_name ||
        payload.name ||
        "";

      setUser({
        id: Number(id),
        email,
        role,
        name: name.toLowerCase().trim(), // 🔥 normalize
      });
    } catch (error) {
      console.error("Invalid token", error);
      logout();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};