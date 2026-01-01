import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useExpenses } from '@/context/ExpenseContext';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Setup Localizer
const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarPage = () => {
    const { expenses } = useExpenses();
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    // Map expenses to events
    const events = useMemo(() => {
        return expenses.map(expense => ({
            title: `$${expense.amount} - ${expense.type}`,
            start: new Date(expense.date), // + timezone adjustment if needed, usually simple Date is fine
            end: new Date(expense.date),
            allDay: true,
            resource: expense,
        }));
    }, [expenses]);

    // Custom coloring
    const eventPropGetter = (event) => {
        const paidBy = event.resource.paidBy;
        let className = "bg-gray-500";
        if (paidBy === 'Tomi') className = "bg-blue-500 border-blue-600";
        if (paidBy === 'Gabi') className = "bg-pink-500 border-pink-600";

        return {
            className: cn("text-xs font-semibold rounded-md px-1 shadow-sm opacity-90 hover:opacity-100 transition-opacity", className)
        };
    };

    // Custom Toolbar
    const CustomToolbar = (toolbar) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        const label = () => {
            const date = toolbar.date;
            return <span className="capitalize">{format(date, 'MMMM yyyy', { locale: es })}</span>;
        };

        return (
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 p-2 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToBack}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={goToCurrent} className="font-semibold text-primary">
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-bold ml-2 text-primary">{label()}</h2>
                </div>

                <div className="flex bg-muted rounded-md p-1">
                    {['month', 'week', 'day'].map((v) => (
                        <button
                            key={v}
                            onClick={() => toolbar.onView(v)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-sm transition-all capitalize",
                                toolbar.view === v ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Popover Component for Events
    const EventComponent = ({ event }) => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <div className="cursor-pointer w-full h-full truncate text-white" title={event.title}>
                        {event.title}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-0 shadow-xl z-50">
                    <Card className="border-0">
                        <CardHeader className={cn("text-white rounded-t-lg py-3",
                            event.resource.paidBy === 'Tomi' ? 'bg-blue-500' :
                                event.resource.paidBy === 'Gabi' ? 'bg-pink-500' : 'bg-gray-500'
                        )}>
                            <CardTitle className="text-base flex justify-between items-center">
                                {event.resource.type}
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {event.resource.paidBy}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center text-2xl font-bold text-primary">
                                ${event.resource.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                                <div>
                                    <span className="font-medium">Fecha:</span> {format(new Date(event.resource.date), 'dd/MM/yyyy')}
                                </div>
                                <div className="col-span-2 mt-2 pt-2 border-t text-xs italic">
                                    ID: {event.resource.id.slice(0, 8)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Calendario de Gastos</h1>
                    <p className="text-muted-foreground">Visualiza tus movimientos en el tiempo</p>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-4 h-[600px] md:h-[700px]">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={['month', 'week', 'day']}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        culture='es'
                        eventPropGetter={eventPropGetter}
                        components={{
                            toolbar: CustomToolbar,
                            event: EventComponent
                        }}
                        messages={{
                            next: "Sig",
                            previous: "Ant",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                            date: "Fecha",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "Sin gastos en este rango."
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
