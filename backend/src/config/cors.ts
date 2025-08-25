import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {

    const whitelist: (string | undefined)[] = [
      process.env.FRONTEND_URL,
    ];

    // Permitir llamadas internas backend → backend (sin Origin)
    if (!origin) {
      if (process.env.ALLOW_BACKEND_CALLS === 'true') {
        return callback(null, true);
      }
      return callback(new Error('CORS bloqueado: llamadas internas no permitidas'));
    }

    // Permitir solo si está en la whitelist
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS bloqueado: origen ${origin} no autorizado`));
  },
  credentials: true,
};
