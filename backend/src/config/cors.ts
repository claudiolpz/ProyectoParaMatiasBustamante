import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whitelist = []
        whitelist.push(process.env.URL_FRONTEND);
        if(process.argv[2] === '--api'){
            whitelist.push(undefined);
        }

        if(whitelist.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('Error de Cors'))
        }
    }
}