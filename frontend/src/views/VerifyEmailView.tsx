import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import api from '../config/axios';

const VerifyEmailView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const toastShown = useRef(false);

   useEffect(() => {
        if (!toastShown.current) {
            if (status === 'success' && message) {
                toast.success(message);
                toastShown.current = true;
            } else if (status === 'error' && message) {
                toast.error(message);
                toastShown.current = true;
            }
        }
    }, [status, message]);
    
    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado');
            return;
        }
        
        const verifyEmail = async () => {
            try {
                const { data } = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(data.message);
                
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/auth/login', {
                        state: { message: 'Email verificado. Ya puedes iniciar sesión.' }
                    });
                }, 3000);
                
            } catch (error) {
                setStatus('error');
                if (isAxiosError(error) && error.response) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage('Error al verificar email');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">Verificando email...</h2>
                        <p className="text-gray-600">Por favor espera mientras verificamos tu cuenta.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold text-green-600 mb-2">¡Email verificado!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-600 text-5xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Error de verificación</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="space-y-2">
                            <Link 
                                to="/auth/login" 
                                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Ir al Login
                            </Link>
                            <Link 
                                to="/auth/register" 
                                className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                            >
                                Registrarse de nuevo
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailView;