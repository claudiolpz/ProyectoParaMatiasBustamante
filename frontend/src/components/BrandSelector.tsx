import type { BrandSelectorProps } from "../types";
import ErrorMessage from "./ErrorMessage";

const BrandSelector = ({
    register,
    errors,
    brands,
    loadingBrands,
    showNewBrandInput
}: BrandSelectorProps) => {
    return (
        <>
            {/* Select de marcas */}
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="brandId" className="text-2xl text-slate-500">
                    Marca
                </label>
                <select
                    id="brandId"
                    className="bg-slate-100 border-none p-3 rounded-lg"
                    {...register("brandId", {
                        required: false // Marca no es obligatoria
                    })}
                    disabled={loadingBrands}
                >
                    <option value="">
                        {loadingBrands ? "Cargando marcas..." : "Seleccionar marca (opcional)"}
                    </option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                    <option value="0">Crear nueva marca</option>
                </select>
                {errors.brandId && <ErrorMessage>{errors.brandId.message}</ErrorMessage>}
            </div>

            {/* Input para nueva marca */}
            {showNewBrandInput && (
                <div className="grid grid-cols-1 space-y-3 bg-green-50 p-4 rounded-lg border-2 border-green-200 transition-all duration-300">
                    <label htmlFor="brandName" className="text-2xl text-slate-500 flex items-center">
                        Nombre de la Nueva Marca
                    </label>
                    <input
                        id="brandName"
                        type="text"
                        placeholder="Ingresa el nombre de la nueva marca"
                        className="bg-white border-2 border-green-300 p-3 rounded-lg placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        {...register("brandName", {
                            required: showNewBrandInput ? "El Nombre de la Marca es obligatorio" : false,
                            minLength: {
                                value: 2,
                                message: "El Nombre de la Marca debe tener al menos 2 caracteres"
                            },
                            maxLength: {
                                value: 50,
                                message: "El Nombre de la Marca no puede tener más de 50 caracteres"
                            }
                        })}
                    />
                    {errors.brandName && <ErrorMessage>{errors.brandName.message}</ErrorMessage>}
                    <p className="text-sm text-green-600">
                        Si la marca no existe, se creará automáticamente al enviar el formulario.
                    </p>
                </div>
            )}
        </>
    );
};

export default BrandSelector;
