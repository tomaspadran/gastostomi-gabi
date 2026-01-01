import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');

    // New States
    const [loginError, setLoginError] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError(''); // Clear previous errors

        if (login(username, password)) {
            toast.success('Inicio de sesión exitoso');
            navigate('/dashboard');
        } else {
            setLoginError('Credenciales incorrectas. Verifique su usuario y contraseña.');
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (username.length < 3 || password.length < 4) {
            toast.error('El usuario debe tener al menos 3 caracteres y la contraseña 4.');
            return;
        }

        if (register(username, password)) {
            toast.success('¡Registro exitoso! Bienvenido.');
            navigate('/dashboard');
        } else {
            toast.error('El usuario ya existe. Intenta con otro nombre.');
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        if (!recoveryEmail.includes('@')) {
            toast.error("Por favor ingrese un email válido");
            return;
        }

        try {
            toast.loading("Enviando correo...", { id: 'sending-email' });

            const response = await fetch('http://localhost:3001/api/recover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: recoveryEmail }),
            });

            if (response.ok) {
                toast.success(`Se ha enviado un correo de recuperación a ${recoveryEmail}`, { id: 'sending-email' });
                setIsRecovering(false);
                setRecoveryEmail('');
            } else {
                const data = await response.json();
                toast.error(data.error || "Error al enviar el correo", { id: 'sending-email' });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión con el servidor", { id: 'sending-email' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm z-10"
            >
                <Card className="shadow-2xl border-t-8 border-t-primary/80 backdrop-blur-sm bg-card/95">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            Gastos Tomi/Gabi
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Gestión financiera inteligente para el hogar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">

                        <AnimatePresence mode="wait">
                            {isRecovering ? (
                                <motion.div
                                    key="recovery"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="mb-4">
                                        <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground" onClick={() => setIsRecovering(false)}>
                                            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-semibold text-lg">Recuperar Contraseña</h3>
                                            <p className="text-sm text-muted-foreground">Ingresa tu email para recibir instrucciones.</p>
                                        </div>
                                        <form onSubmit={handleRecovery} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="recovery-email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="recovery-email"
                                                        placeholder="ejemplo@email.com"
                                                        className="pl-9"
                                                        value={recoveryEmail}
                                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full">Enviar Correo</Button>
                                        </form>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="main-auth"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => { setActiveTab(v); setLoginError(''); }} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="login">Ingresar</TabsTrigger>
                                            <TabsTrigger value="register">Registrarse</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="login">
                                            <form onSubmit={handleLogin} className="space-y-4">
                                                {loginError && (
                                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {loginError}
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label htmlFor="username">Usuario</Label>
                                                    <Input
                                                        id="username-login"
                                                        placeholder="Tu nombre de usuario"
                                                        value={username}
                                                        onChange={(e) => { setUsername(e.target.value); setLoginError(''); }}
                                                        className={loginError ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Contraseña</Label>
                                                    <Input
                                                        id="password-login"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                                                        className={loginError ? "border-destructive focus-visible:ring-destructive" : "bg-background/50"}
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full text-lg shadow-md mt-4">
                                                    Ingresar
                                                </Button>
                                                <div className="text-center mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsRecovering(true)}
                                                        className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                                                    >
                                                        ¿Olvidaste tu contraseña?
                                                    </button>
                                                </div>
                                            </form>
                                        </TabsContent>

                                        <TabsContent value="register">
                                            <form onSubmit={handleRegister} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username-reg">Nuevo Usuario</Label>
                                                    <Input
                                                        id="username-reg"
                                                        placeholder="Elige un nombre"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="bg-background/50"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password-reg">Contraseña</Label>
                                                    <Input
                                                        id="password-reg"
                                                        type="password"
                                                        placeholder="Crea una contraseña segura"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="bg-background/50"
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" variant="secondary" className="w-full text-lg shadow-md mt-4">
                                                    Crear Cuenta
                                                </Button>
                                            </form>
                                        </TabsContent>
                                    </Tabs>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </CardContent>
                    <CardFooter className="justify-center text-xs text-muted-foreground pb-6">
                        v1.3 • Premium Edition
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
