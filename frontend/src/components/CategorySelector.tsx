import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateProductForm, Category } from "../types";
import ErrorMessage from "./ErrorMessage";

type CategorySelectorProps = {
    register: UseFormRegister<CreateProductForm>;
    errors: FieldErrors<CreateProductForm>;
    categories: Category[];
    loadingCategories: boolean;
    showNewCategoryInput: boolean;
};

const CategorySelector = ({
    register,
    errors,
    categories,
    loadingCategories,
    showNewCategoryInput
}: CategorySelectorProps) => {
    return (
        <>
            {/* Select de categorías */}
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor="categoryId" className="text-2xl text-slate-500">
                    Categoría
                </label>
                <select
                    id="categoryId"
                    className="bg-slate-100 border-none p-3 rounded-lg"
                    {...register("categoryId", {
                        required: showNewCategoryInput ? false : "Debe seleccionar una categoría"
                    })}
                    disabled={loadingCategories}
                >
                    <option value="">
                        {loadingCategories ? "Cargando categorías..." : "Seleccionar categoría"}
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                    <option value="0">Crear nueva categoría</option>
                </select>
                {errors.categoryId && <ErrorMessage>{errors.categoryId.message}</ErrorMessage>}
            </div>

            {/* Input para nueva categoría */}
            {showNewCategoryInput && (
                <div className="grid grid-cols-1 space-y-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200 transition-all duration-300">
                    <label htmlFor="categoryName" className="text-2xl text-slate-500 flex items-center">
                        Nombre de la Nueva Categoría
                    </label>
                    <input
                        id="categoryName"
                        type="text"
                        placeholder="Ingresa el nombre de la nueva categoría"
                        className="bg-white border-2 border-blue-300 p-3 rounded-lg placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        {...register("categoryName", {
                            required: showNewCategoryInput ? "El nombre de la categoría es obligatorio" : false,
                            minLength: {
                                value: 2,
                                message: "El nombre debe tener al menos 2 caracteres"
                            },
                            maxLength: {
                                value: 50,
                                message: "El nombre no puede tener más de 50 caracteres"
                            }
                        })}
                    />
                    {errors.categoryName && <ErrorMessage>{errors.categoryName.message}</ErrorMessage>}
                    <p className="text-sm text-blue-600">
                        Si la categoría no existe, se creará automáticamente al enviar el formulario.
                    </p>
                </div>
            )}
        </>
    );
};

export default CategorySelector;