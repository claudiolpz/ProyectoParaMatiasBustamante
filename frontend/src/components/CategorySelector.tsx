import { memo } from "react";
import type { CategorySelectorProps } from "../types";
import SelectorWithCreate from "./SelectorWithCreate";

const CategorySelector = memo(({
    register,
    errors,
    categories,
    loadingCategories,
    showNewCategoryInput,
}: CategorySelectorProps) => (
    <SelectorWithCreate
        register={register}
        errors={errors}
        items={categories}
        loading={loadingCategories}
        showNewInput={showNewCategoryInput}
        selectKey="categoryId"
        nameKey="categoryName"
        label="Categoría"
        colorScheme="blue"
        createLabel="Crear nueva categoría"
        newItemLabel="Nombre de la Nueva Categoría"
        placeholder="Seleccionar categoría"
        loadingPlaceholder="Cargando categorías..."
        helpText="Si la categoría no existe, se creará automáticamente al enviar el formulario."
        selectValidation={{
            required: showNewCategoryInput ? false : "Debe Seleccionar una Categoría",
        }}
        nameValidation={{
            required: showNewCategoryInput ? "El Nombre de la Categoría es obligatorio" : false,
            minLength: { value: 2, message: "El Nombre de la Categoría debe tener al menos 2 caracteres" },
            maxLength: { value: 50, message: "El Nombre de la Categoría no puede tener más de 50 caracteres" },
        }}
    />
));

CategorySelector.displayName = 'CategorySelector';

export default CategorySelector;
