import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, LogOut, TrendingUp, AlertCircle, DollarSign, Calendar, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { expenses, TOP_LEVEL_CATEGORIES } = useExpenses();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State for filter
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'yearly', 'all_time'

    // Category Filter & Grouping
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [groupVisuals, setGroupVisuals] = useState(true);

    const months = [
        { value: '0', label: 'Enero' },
        { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' },
        { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' },
        { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' },
        { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' },
        { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' },
        { value: '11', label: 'Diciembre' },
    ];

    // Handle View Mode Changes
    const handleMonthChange = (val) => {
        if (val === 'all') {
            setViewMode('yearly');
            setSelectedMonth('all');
        } else {
            setViewMode('monthly');
            setSelectedMonth(val);
        }
    };

    const toggleAllTime = () => {
        if (viewMode === 'all_time') {
            // Revert to default
            setViewMode('monthly');
            setSelectedMonth(new Date().getMonth().toString());
        } else {
            setViewMode('all_time');
        }
    };

    // Filter expenses logic
    const filteredExpenses = useMemo(() => {
        if (viewMode === 'all_time') {
            return expenses;
        }

        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getFullYear().toString();

            if (viewMode === 'yearly') {
                return expenseYear === selectedYear;
            }

            // Monthly
            return date.getMonth().toString() === selectedMonth && expenseYear === selectedYear;
        });
    }, [expenses, selectedMonth, selectedYear, viewMode]);

    // Aggregate data for chart
    const data = useMemo(() => {
        const agg = filteredExpenses.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
            return acc;
        }, {});

        return Object.keys(agg).map(key => ({
            name: key,
            value: agg[key]
        }));
    }, [filteredExpenses]);

    // Calculations
    const totalSpent = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);

    const topCategory = useMemo(() => {
        if (data.length === 0) return null;
        return data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    }, [data]);

    // Suggestions logic
    const suggestion = useMemo(() => {
        if (filteredExpenses.length === 0) return "No hay gastos registrados en este período.";
        if (!topCategory) return "Comienza a registrar tus gastos para obtener sugerencias.";

        const percentage = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;

        let contextText = viewMode === 'all_time' ? "históricamente" :
            viewMode === 'yearly' ? "este año" : "este mes";

        if (topCategory.name === 'Supermercado' && percentage > 40) {
            return `Tu gasto en Supermercado es alto (${percentage}% ${contextText}). Considera buscar ofertas o planificar mejor tus compras.`;
        }
        if (topCategory.name === 'Nafta' && percentage > 20) {
            return `Gastas un ${percentage}% en Nafta ${contextText}. ¿Es posible optimizar tus rutas o compartir viajes?`;
        }
        if (topCategory.name === 'Perra' && percentage > 15) {
            return `¡Tu mascota está viviendo la gran vida! (${percentage}% de gastos ${contextText}).`;
        }

        return `Tu mayor gasto ${contextText} es en ${topCategory.name} (${percentage}%). Intenta vigilar esta categoría.`;
    }, [topCategory, totalSpent, viewMode, filteredExpenses.length]);

    // Logout is now handled in Navbar
    // const handleLogout = () => { ... } removed

    // Helper for display text
    const periodText = useMemo(() => {
        if (viewMode === 'all_time') return 'Historial Completo';
        if (viewMode === 'yearly') return `Todo el Año ${selectedYear}`;
        return `${months.find(m => m.value === selectedMonth)?.label || ''} ${selectedYear}`;
    }, [viewMode, selectedMonth, selectedYear]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.username || 'Usuario'}</p>
                </div>
            </div>

            {/* Filters and Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn("col-span-full md:col-span-1 border-primary/20", viewMode === 'all_time' ? "bg-purple-50 border-purple-200" : "bg-primary/5")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Total Gastado
                            {viewMode === 'all_time' && <History className="h-4 w-4 text-purple-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold flex items-center">
                            <DollarSign className={cn("h-8 w-8 mr-2", viewMode === 'all_time' ? "text-purple-600" : "text-primary")} />
                            {totalSpent.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {periodText}
                        </p>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card className="col-span-full md:col-span-3 lg:col-span-3 flex flex-col md:flex-row items-center gap-4 p-6 justify-between bg-card/50">
                    <div className="flex flex-col md:flex-row gap-4 w-full justify-end items-end">
                        <div className="w-full md:w-auto">
                            <Button
                                variant={viewMode === 'all_time' ? "default" : "outline"}
                                onClick={toggleAllTime}
                                className={cn("w-full transition-all", viewMode === 'all_time' && "bg-purple-600 hover:bg-purple-700")}
                            >
                                <History className="mr-2 h-4 w-4" />
                                {viewMode === 'all_time' ? "Viendo Historial" : "Ver Historial Completo"}
                            </Button>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-sm font-medium mb-1 block">Mes</label>
                            <Select
                                value={selectedMonth}
                                onValueChange={handleMonthChange}
                                disabled={viewMode === 'all_time'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                    <div className="h-px bg-muted my-1" />
                                    <SelectItem value="all" className="font-semibold text-primary">
                                        Todo el año
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-sm font-medium mb-1 block">Año</label>
                            <Select
                                value={selectedYear}
                                onValueChange={setSelectedYear}
                                disabled={viewMode === 'all_time'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['2024', '2025', '2026', '2027'].map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts and Analysis */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* Chart */}
                <Card className="col-span-4 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Distribución de Gastos
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md text-xs">
                                    {periodText}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <Switch id="group-mode" checked={groupVisuals} onCheckedChange={setGroupVisuals} />
                                    <Label htmlFor="group-mode" className="text-xs font-normal text-muted-foreground">Agrupar</Label>
                                </div>
                            </div>
                        </CardTitle>
                        <CardDescription>Desglose por categoría del período seleccionado</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`$${value}`, 'Monto']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                                <Calendar className="h-10 w-10 opacity-20" />
                                <p>No hay gastos registrados en este período.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Insights */}
                <Card className="col-span-3 shadow-md lg:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Análisis y Sugerencias
                        </CardTitle>
                        <CardDescription>
                            Insights basados en tus hábitos de consumo ({viewMode === 'all_time' ? 'Histórico' : 'Periodo actual'})
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Categoría Top</div>
                            <div className="text-2xl font-bold flex items-center justify-between p-3 bg-muted rounded-lg border">
                                {topCategory ? topCategory.name : 'N/A'}
                                <span className={cn("text-lg font-normal", viewMode === 'all_time' ? "text-purple-600" : "text-primary")}>
                                    {topCategory ? `$${topCategory.value}` : '$0'}
                                </span>
                            </div>
                        </div>

                        <div className={cn("rounded-md border p-4", viewMode === 'all_time' ? "bg-purple-50 border-purple-100" : "bg-accent/20")}>
                            <div className="flex items-start gap-4">
                                <AlertCircle className={cn("mt-1 h-5 w-5", viewMode === 'all_time' ? "text-purple-600" : "text-primary")} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Consejo Financiero</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {suggestion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Stats Mini-Cards if History Mode */}
                        {viewMode === 'all_time' && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="bg-muted p-3 rounded-md text-center">
                                    <div className="text-xs text-muted-foreground">Total Movimientos</div>
                                    <div className="text-lg font-bold">{filteredExpenses.length}</div>
                                </div>
                                <div className="bg-muted p-3 rounded-md text-center">
                                    <div className="text-xs text-muted-foreground">Promedio/Gasto</div>
                                    <div className="text-lg font-bold">
                                        ${filteredExpenses.length > 0 ? Math.round(totalSpent / filteredExpenses.length) : 0}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Link to="/add-expense" className="w-full">
                            <Button variant="secondary" className="w-full shadow-sm hover:shadow">Registrar nuevo movimiento</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
