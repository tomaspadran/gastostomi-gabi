import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    // Cargar gastos desde localStorage al iniciar
    const [expenses, setExpenses] = useState(() => {
        const savedExpenses = localStorage.getItem('expenses');
        return savedExpenses ? JSON.parse(savedExpenses) : [];
    });

    // Cargar categorías personalizadas desde localStorage
    const [customCategories, setCustomCategories] = useState(() => {
        const savedCategories = localStorage.getItem('customCategories');
        return savedCategories ? JSON.parse(savedCategories) : [];
    });

    const TOP_LEVEL_CATEGORIES = [
        "Supermercado",
        "Nafta",
        "Perra",
        "Salidas",
        "Servicios",
        "Varios"
    ];

    // Guardar gastos cada vez que cambien
    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    // Guardar categorías cada vez que cambien
    useEffect(() => {
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
    }, [customCategories]);

    const addExpense = (expense) => {
        setExpenses(prev => [...prev, { ...expense, id: Date.now() }]);
    };

    // --- CÓDIGO NUEVO: Función para eliminar ---
    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const addCategory = (category) => {
        if (!TOP_LEVEL_CATEGORIES.includes(category) && !customCategories.includes(category)) {
            setCustomCategories(prev => [...prev, category]);
        }
    };

    return (
        <ExpenseContext.Provider value={{ 
            expenses, 
            addExpense, 
            deleteExpense, // Exportamos la función de eliminar
            customCategories, 
            addCategory, 
            TOP_LEVEL_CATEGORIES 
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};

