import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Importación necesaria
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, LogOut, TrendingUp, AlertCircle, DollarSign, Calendar, History, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { expenses, TOP_LEVEL_CATEGORIES } = useExpenses();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [viewMode, setViewMode] = useState('monthly'); 
    const [groupVisuals, setGroupVisuals] = useState(true);

    const months = [
        { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' },
        { value: '2', label: 'Marzo' }, { value: '3', label: 'Abril' },
        { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
        { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' },
        { value: '8', label: 'Septiembre' }, { value: '9', label: 'Octubre' },
        { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' },
    ];

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
            setViewMode('monthly');
            setSelectedMonth(new Date().getMonth().toString());
        } else {
            setViewMode('all_time');
        }
    };

    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        if (viewMode === 'all_time') return expenses;
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const expenseYear = date.getFullYear().toString();
            if (viewMode === 'yearly') return expenseYear === selectedYear;
            return date.getMonth().toString() === selectedMonth && expenseYear === selectedYear;
        });
    }, [expenses, selectedMonth, selectedYear, viewMode]);

    const data = useMemo(() => {
        const agg = filteredExpenses.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
            return acc;
        }, {});
        return Object.keys(agg).map(key => ({ name: key, value: agg[key] }));
    }, [filteredExpenses]);

    const totalSpent = useMemo(() => filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0), [filteredExpenses]);

    const topCategory = useMemo(() => {
        if (data.length === 0) return null;
        return data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    }, [data]);

    const suggestion = useMemo(() => {
        if (filteredExpenses.length === 0) return "No hay gastos registrados en este período.";
        if (!topCategory) return "Comienza a registrar tus gastos para obtener sugerencias.";
        const percentage = totalSpent > 0 ? Math.round((topCategory.value / totalSpent) * 100) : 0;
        let contextText = viewMode === 'all_time' ? "históricamente" : viewMode === 'yearly' ? "este año" : "este mes";
        return `Tu mayor gasto ${contextText} es en ${topCategory.name} (${percentage}%). Intenta vigilar esta categoría.`;
    }, [topCategory, totalSpent, viewMode, filteredExpenses.length]);

    const periodText = useMemo(() => {
        if (viewMode === 'all_time') return 'Historial Completo';
        if (viewMode === 'yearly') return `Todo el Año ${selectedYear}`;
        return `${months.find(m => m.value === selectedMonth)?.label || ''} ${selectedYear}`;
    }, [viewMode, selectedMonth, selectedYear]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.username || 'Usuario'}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cn("col-span-full md:col-span-1 border-primary/20", viewMode === 'all_time' ? "bg-purple-50/10 border-purple-500" : "bg-primary/5")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Total Gastado
                            {viewMode === 'all_time' && <History className="h-4 w-4 text-purple-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold flex items-center">
                            <DollarSign className={cn("h-8 w-8 mr-2", viewMode === 'all_time' ? "text-purple-500" : "text-primary")} />
                            {totalSpent.toLocaleString('es-AR')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{periodText}</p>
                    </CardContent>
                </Card>

                <Card className="col-span-full md:col-span-3 lg:col-span-3 flex flex-col md:flex-row items-center gap-4 p-6 justify-between bg-card/50">
                    <div className="flex flex-col md:flex-row gap-4 w-full justify-end items-end">
                        <div className="w-full md:w-auto">
                            <Button 
                                variant={viewMode === 'all_time' ? "default" : "outline"} 
                                onClick={toggleAllTime}
                                className={cn(viewMode === 'all_time' && "bg-purple-600 hover:bg-purple-700")}
                            >
                                <History className="mr-2 h-4 w-4" />
                                {viewMode === 'all_time' ? "Viendo Historial" : "Ver Historial Completo"}
                            </Button>
                        </div>
                        <div className="w-full md:w-48">
                            <Label className="mb-1 block">Mes</Label>
                            <Select value={selectedMonth} onValueChange={handleMonthChange} disabled={viewMode === 'all_time'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    <SelectItem value="all" className="font-semibold text-primary">Todo el año</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Label className="mb-1 block">Año</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={viewMode === 'all_time'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                            Distribución de Gastos
                            <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md">{periodText}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={100}
                                        paddingAngle={5} dataKey="value"
                                    >
                                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value}`} />
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

                <Card className="lg:col-span-3 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" /> Sugerencias
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Mayor Gasto</div>
                            <div className="text-2xl font-bold flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                                {topCategory ? topCategory.name : 'N/A'}
                                <span className="text-primary">{topCategory ? `$${topCategory.value.toLocaleString('es-AR')}` : '$0'}</span>
                            </div>
                        </div>
                        <div className="rounded-xl border p-4 bg-primary/5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-1 h-5 w-5 text-primary" />
                                <p className="text-sm leading-relaxed">{suggestion}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link to="/add-expense">Registrar nuevo movimiento</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
