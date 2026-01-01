import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check local storage for persistent login
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (username, password) => {
        if (!username || !password) return false;

        // Get registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

        // Find user
        const foundUser = registeredUsers.find(u => u.username === username && u.password === password);

        if (foundUser) {
            const userSession = { username: foundUser.username };
            setUser(userSession);
            localStorage.setItem('user', JSON.stringify(userSession));
            return true;
        }

        return false;
    };

    const register = (username, password) => {
        if (!username || !password) return false;

        const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

        // Check if user exists
        if (registeredUsers.some(u => u.username === username)) {
            return false; // User already exists
        }

        const newUser = { username, password }; // In a real app, hash the password!
        registeredUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

        // Auto login after register? Or require login? Let's auto login for UX.
        const userSession = { username };
        setUser(userSession);
        localStorage.setItem('user', JSON.stringify(userSession));

        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
