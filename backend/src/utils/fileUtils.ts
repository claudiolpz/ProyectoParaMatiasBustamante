import fs from 'fs';
import path from 'path';

// Función para limpiar archivo en caso de error
export const cleanupFile = (filename: string): void => {
    try {
        fs.unlinkSync(path.join('public/uploads/products', filename));
        console.log("Archivo eliminado por error:", filename);
    } catch (unlinkError) {
        console.error("Error al eliminar archivo:", unlinkError);
    }
};
