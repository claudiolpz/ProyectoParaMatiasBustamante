import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {

        const whitelist = [].filter(Boolean);
        whitelist.push(process.env.FRONTEND_URL);
        if(process.argv[2] === '--api'){
            whitelist.push(undefined);
        }

        if (!origin) {
            const req = (callback as any).req;
            const referer = req?.headers?.referer;
            const userAgent = req?.headers['user-agent'];
            const method = req?.method;
            const url = req?.url;
            
            console.log('🔍 === PETICIÓN SIN ORIGEN ===');
            console.log('🔍 Referer:', referer);
            console.log('🔍 User-Agent:', userAgent);
            console.log('🔍 Método:', method);
            console.log('🔍 URL:', url);
            console.log('🔍 Headers completos:', req?.headers);
            
            // Validaciones de seguridad múltiples
            const isValidReferer = referer && referer.includes(process.env.FRONTEND_URL);
            
            const isValidMethod = ['POST', 'PUT'].includes(method); // Solo métodos de upload
            const isUploadEndpoint = url?.includes('/upload') || url?.includes('/image'); // Ajusta según tus rutas
            const hasValidUserAgent = userAgent && !userAgent.includes('bot') && !userAgent.includes('crawler');
            
            console.log('🔍 ¿Referer válido?:', isValidReferer);
            console.log('🔍 ¿Método válido?:', isValidMethod);
            console.log('🔍 ¿Endpoint de upload?:', isUploadEndpoint);
            console.log('🔍 ¿User-Agent válido?:', hasValidUserAgent);
            
            // Solo permitir si cumple TODAS las condiciones
            if (isValidReferer && isValidMethod && isUploadEndpoint && hasValidUserAgent) {
                console.log('Permitido: petición sin origen con validaciones de seguridad pasadas');
                return callback(null, true);
            }
            
            console.log('Rechazado: petición sin origen no cumple validaciones de seguridad');
            return callback(new Error('Error de CORS: Origen no válido'));
        }

        if(whitelist.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('Error de Cors'))
        }
    }
}