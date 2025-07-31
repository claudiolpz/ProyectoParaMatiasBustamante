import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateProductForm } from "../types";
import ErrorMessage from "./ErrorMessage";

interface ProductFormFieldsProps {
    register: UseFormRegister<CreateProductForm>;
    errors: FieldErrors<CreateProductForm>;
}

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
                        required: "El nombre del producto es obligatorio",
                    })}
                />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </div>

            {/* 2. SKU */}
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="sku" className="text-2xl text-slate-500">
                    SKU (Opcional)
                </label>
                <input
                    id="sku"
                    type="text"
                    placeholder="SKU del producto"
                    className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                    {...register("sku")}
                />
                {errors.sku && <ErrorMessage>{errors.sku.message}</ErrorMessage>}
            </div>
        </>
    );
};

export default ProductFormFields;