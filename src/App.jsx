import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider } from '@/context/ThemeContext'; // Importación importante
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AddExpense from '@/pages/AddExpense';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import CalendarPage from '@/pages/CalendarPage';

const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    /* ESTA ES LA PIEZA CLAVE QUE FALTA EN TU PROYECTO */
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> 
      <AuthProvider>
        <ExpenseProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground antialiased font-sans">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <Dashboard />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <ProtectedLayout>
                        <CalendarPage />
                      </ProtectedLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-expense"
                  element={
                    <ProtectedRoute>
                      <AddExpense />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
