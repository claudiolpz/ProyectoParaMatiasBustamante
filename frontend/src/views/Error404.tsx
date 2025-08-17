import { useNavigate } from 'react-router';
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';

const Error404 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoProducts = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Número 404 */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-black text-slate-700 mb-4">
            404
          </h1>
        </div>

        {/* Mensaje */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Página no encontrada
          </h2>
          <p className="text-slate-400 leading-relaxed">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Botones - Solo 2 opciones útiles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoProducts}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <SearchOutlined className="text-lg" />
            <span>Ver Productos</span>
          </button>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <ArrowLeftOutlined className="text-lg" />
            <span>Volver</span>
          </button>
        </div>

        {/* Código de error discreto */}
        <div className="mt-12">
          <p className="text-slate-600 text-sm">Error 404</p>
        </div>
      </div>
    </div>
  );
};

export default Error404;