import { Link } from 'react-router';
import { InstagramOutlined, EnvironmentOutlined, WhatsAppOutlined } from '@ant-design/icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white select-none">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
                    {/* Marca */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                            <img alt="Logo" src="/biceps.svg" className="h-8 w-8" />
                            <span className="text-lg font-semibold">Pf.MatiasB</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Profesor Matías. <br/> Preparador físico certificado. <br/>Instructor De Spinning®.
                        </p>
                    </div>

                    {/* Enlaces / Servicios (nueva columna para balance) */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="text-sm font-semibold">Servicios</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>Venta de suplementos</li>
                            <li><Link to="/" className="hover:text-white transition-colors">Ver productos</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="flex flex-col space-y-4">
                        <h4 className="text-sm font-semibold">Contacto</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-3">
                                <WhatsAppOutlined className="text-white opacity-75" />
                                <Link to="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    +569XXXXXXXX
                                </Link>
                            </li>
                            <li className="flex items-start gap-3">
                                <EnvironmentOutlined className="text-white opacity-75 mt-1" />
                                <span>San Bernardo<br/>Santiago, Chile</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <InstagramOutlined className="text-white opacity-75" />
                                <Link to="https://www.instagram.com/pf.matiasb/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    Pf.MatiasB
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-3 text-center text-sm text-gray-400">
                    © {currentYear} Pf.MatiasB. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;