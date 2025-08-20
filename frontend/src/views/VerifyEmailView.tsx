import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../config/axios';

const VerifyEmailView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resendingEmail, setResendingEmail] = useState(false);
    const toastShown = useRef(false);

    useEffect(() => {
        if (!toastShown.current) {
            if (status === 'error' && message) {
                toast.error(message);
                toastShown.current = true;
            } else if (status === 'expired' && message) {
                toast.warning(message);
                toastShown.current = true;
            }
        }
    }, [status, message]);

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Email no disponible. Vuelve a registrarte.');
            return;
        }

        setResendingEmail(true);
        try {
            const { data } = await api.post('/auth/resend-verification', { email });
            toast.success(data.message);
            setStatus('loading');
            setMessage('Nuevo email enviado. Revisa tu bandeja de entrada.');
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al reenviar email');
            }
        } finally {
            setResendingEmail(false);
        }
    };

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token de verificación no encontrado');
            return;
        }

        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }

        const verifyEmail = async () => {
            try {
                const { data } = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(data.message);

                setTimeout(() => {
                    navigate('/auth/login', {
                        state: {
                            message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
                            type: 'success'
                        }
                    });
                }, 2000);

            } catch (error) {
                setStatus('error');
                if (isAxiosError(error) && error.response) {
                    const errorMessage = error.response.data.error;

                    if (errorMessage.includes('expirado') || errorMessage.includes('expired')) {
                        setStatus('expired');
                        setMessage(errorMessage);
                    } else {
                        setMessage(errorMessage);
                    }
                } else {
                    setMessage('Error al verificar email');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <>
            {status === 'loading' && (

                <div className="text-center">
                    <LoadingOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">Verificando email...</h1>
                    <div className="bg-white px-5 py-8 rounded-lg">
                        <p className="text-gray-600">Por favor espera mientras verificamos tu cuenta.</p>
                    </div>
                </div>

            )}

            {status === 'success' && (
                <div className="text-center">
                    <CheckCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">¡Email verificado!</h1>
                    <div className="bg-white px-5 py-8 rounded-lg">
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
                    </div>
                </div>

            )}

            {status === 'expired' && (

                <div className="text-center">
                    <ClockCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">Token expirado</h1>
                    <div className="bg-white px-5 py-8 rounded-lg space-y-4">
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="space-y-3">
                            {email && (
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendingEmail}
                                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {resendingEmail ? 'Enviando...' : 'Reenviar email de verificación'}
                                </button>
                            )}
                            <Link
                                to="/auth/register"
                                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
                            >
                                Registrarse de nuevo
                            </Link>
                            <Link
                                to="/auth/login"
                                className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-center"
                            >
                                Ir al Login
                            </Link>
                        </div>
                    </div>
                </div>

            )}

            {status === 'error' && (

                <div className="text-center">
                    <CloseCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">Error de verificación</h1>
                    <div className="bg-white px-5 py-8 rounded-lg space-y-4">
                        <p className="text-gray-600 mb-4">{message}</p>
                        <div className="space-y-2">
                            <Link
                                to="/auth/login"
                                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
                            >
                                Ir al Login
                            </Link>
                            <Link
                                to="/auth/register"
                                className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-center"
                            >
                                Registrarse de nuevo
                            </Link>
                        </div>
                    </div>
                </div>

            )}
        </>
    );
};

export default VerifyEmailView;