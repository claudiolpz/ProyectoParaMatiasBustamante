import type { ProductFormFieldsProps } from "../types";
import ErrorMessage from "./ErrorMessage";

const ProductFormFields = ({ register, errors }: ProductFormFieldsProps) => {
    return (
        <>
            {/* 1. Nombre del producto */}
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="name" className="text-2xl text-slate-500">
                    Nombre del Producto
                </label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nombre del producto"
                    className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                    {...register("name", {
                        required: "El Nombre del Producto es obligatorio",
                    })}
                />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            {/* 2. Marca */}
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="brand" className="text-2xl text-slate-500">
                    Marca
                </label>
                <input
                    id="brand"
                    type="text"
                    placeholder="Marca del producto"
                    className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                    {...register("brand")}
                />
                {errors.brand && <ErrorMessage>{errors.brand.message}</ErrorMessage>}
            </div>
        </>
    );
};

export default ProductFormFields;