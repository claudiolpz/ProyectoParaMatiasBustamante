declare global {
    namespace Express {
        namespace Multer {
            interface File {
                public_id?: string;
                cloudinary?: any;
            }
        }
    }
}

export {};