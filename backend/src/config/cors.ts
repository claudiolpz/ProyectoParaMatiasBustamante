import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        console.log('CORS Origin:', origin);
    }
}