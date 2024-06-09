import React, { createContext, useState } from 'react';

// Create the context
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        studentId: ''
    });

    const updateUser = (userInfo) => {
        setUser(prev => ({ ...prev, ...userInfo }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
