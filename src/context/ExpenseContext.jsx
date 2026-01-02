import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export const useExpenses = () => useContext(ExpenseContext);

export const TOP_LEVEL_CATEGORIES = {
    "Juana": ["Colegio", "Pañales", "Leche", "Otros"],
    "Auto": ["Patente", "Seguro", "Nafta", "Mantenimiento", "Otros"],
    "Servicios": ["Internet", "Teléfono", "Luz", "Gas"],
    "Simple": ["Supermercado", "Perra", "Limpieza", "Alquiler"]
};

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [customCategories, setCustomCategories] = useState([]); // El nombre correcto es customCategories

    useEffect(() => {
        const storedExpenses = localStorage.getItem('expenses');
        if (storedExpenses) {
            setExpenses(JSON.parse(storedExpenses));
        }

        const storedCategories = localStorage.getItem('expenseCategories');
        if (storedCategories) {
            setCustomCategories(JSON.parse(storedCategories)); // Corregido: setCustomCategories
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('expenseCategories', JSON.stringify(customCategories)); // Corregido: customCategories
    }, [customCategories]);

    const addExpense = (expense) => {
        setExpenses((prev) => [...prev, { ...expense, id: crypto.randomUUID(), date: expense.date || new Date().toISOString() }]);
    };

    const deleteExpense = (id) => {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    };

    const addCategory = (category) => {
        setCustomCategories((prev) => { // Corregido: setCustomCategories
            if (!prev.includes(category)) {
                return [...prev, category];
            }
            return prev;
        });
    };

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, customCategories, addCategory, TOP_LEVEL_CATEGORIES }}>
            {children}
        </ExpenseContext.Provider>
    );
};

