import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const AnnualComparison = ({ expenses }) => {
    const currentYear = new Date().getFullYear();
    const [yearA, setYearA] = useState((currentYear - 1).toString());
    const [yearB, setYearB] = useState(currentYear.toString());

    // Generate list of available years based on data + defaults
    const years = useMemo(() => {
        const uniqueYears = new Set(expenses.map(e => new Date(e.date).getFullYear().toString()));
        uniqueYears.add(currentYear.toString());
        uniqueYears.add((currentYear - 1).toString());
        return Array.from(uniqueYears).sort().reverse();
    }, [expenses, currentYear]);

    // Process data
    const comparisonData = useMemo(() => {
        const categories = new Set();
        const dataA = {};
        const dataB = {};

        expenses.forEach(e => {
            const date = new Date(e.date);
            const year = date.getFullYear().toString();
            const cat = e.type;

            if (year === yearA || year === yearB) {
                categories.add(cat);
                if (year === yearA) dataA[cat] = (dataA[cat] || 0) + e.amount;
                if (year === yearB) dataB[cat] = (dataB[cat] || 0) + e.amount;
            }
        });

        const result = Array.from(categories).map(cat => {
            const valA = dataA[cat] || 0;
            const valB = dataB[cat] || 0;
            const diff = valB - valA;
            const percent = valA === 0 ? (valB > 0 ? 100 : 0) : ((diff / valA) * 100);

            return {
                name: cat,
                [yearA]: valA,
                [yearB]: valB,
                diff,
                percent: Math.round(percent)
            };
        });

        return result.sort((a, b) => b[yearB] - a[yearB]); // Sort by current year spending
    }, [expenses, yearA, yearB]);

    return (
        <Card className="col-span-full shadow-md border-t-4 border-t-blue-500">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl">Comparativa Anual</CardTitle>
                        <CardDescription>Analiza cómo han cambiado tus gastos entre dos años</CardDescription>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-600">Año A</span>
                            <Select value={yearA} onValueChange={setYearA}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={`a-${y}`} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">Año B</span>
                            <Select value={yearB} onValueChange={setYearB}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={`b-${y}`} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Chart */}
                <div className="h-[350px] w-full">
                    {comparisonData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value}`} />
                                <Legend />
                                <Bar dataKey={yearA} fill="#3b82f6" name={`Año ${yearA}`} radius={[4, 4, 0, 0]} />
                                <Bar dataKey={yearB} fill="#22c55e" name={`Año ${yearB}`} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No hay suficientes datos para comparar.
                        </div>
                    )}
                </div>

                {/* Diff Table */}
                <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 p-3 font-medium text-sm text-muted-foreground">
                        <div>Categoría</div>
                        <div className="text-right">Total {yearA}</div>
                        <div className="text-right">Total {yearB}</div>
                        <div className="text-right">Variación</div>
                    </div>
                    {comparisonData.map((item) => (
                        <div key={item.name} className="grid grid-cols-4 p-3 border-t text-sm items-center hover:bg-muted/20 transition-colors">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-right text-muted-foreground">${item[yearA].toLocaleString()}</div>
                            <div className="text-right font-semibold">${item[yearB].toLocaleString()}</div>
                            <div className="flex justify-end items-center gap-1">
                                {item.percent > 0 ? (
                                    <div className="flex items-center text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        +{item.percent}%
                                    </div>
                                ) : item.percent < 0 ? (
                                    <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                        {item.percent}%
                                    </div>
                                ) : (
                                    <div className="flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                        <Minus className="h-3 w-3 mr-1" />
                                        0%
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AnnualComparison;
