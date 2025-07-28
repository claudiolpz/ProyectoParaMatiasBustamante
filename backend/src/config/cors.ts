import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        console.log("Origin:", origin);
        if(origin === process.env.URL_FRONTEND || origin === undefined){
            callback(null, true);
        }else{
            callback(new Error('Error de Cors'))
        }
    }
}