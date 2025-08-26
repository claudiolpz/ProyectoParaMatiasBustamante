import type { ProductFormFieldsProps } from "../types";
import ErrorMessage from "./ErrorMessage";
import BrandSelector from "./BrandSelector";
import { useBrands } from "../hooks/useBrands";
import { useEffect, useState } from "react";

const ProductFormFields = ({ register, errors, watch }: ProductFormFieldsProps) => {
    const { brands, loading: loadingBrands, fetchBrands } = useBrands();
    const [showNewBrandInput, setShowNewBrandInput] = useState(false);
    const watchBrandId = watch("brandId");

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    useEffect(() => {
        setShowNewBrandInput(watchBrandId === "0");
    }, [watchBrandId]);

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
            <BrandSelector
                register={register}
                errors={errors}
                brands={brands}
                loadingBrands={loadingBrands}
                showNewBrandInput={showNewBrandInput}
            />
        </>
    );
};

export default ProductFormFields;