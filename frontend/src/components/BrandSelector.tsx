import { memo } from "react";
import type { BrandSelectorProps } from "../types";
import SelectorWithCreate from "./SelectorWithCreate";

const BrandSelector = memo(({
    register,
    errors,
    brands,
    loadingBrands,
    showNewBrandInput,
}: BrandSelectorProps) => (
    <SelectorWithCreate
        register={register}
        errors={errors}
        items={brands}
        loading={loadingBrands}
        showNewInput={showNewBrandInput}
        selectKey="brandId"
        nameKey="brandName"
        label="Marca"
        colorScheme="green"
        createLabel="Crear nueva marca"
        newItemLabel="Nombre de la Nueva Marca"
        placeholder="Seleccionar marca (opcional)"
        loadingPlaceholder="Cargando marcas..."
        helpText="Si la marca no existe, se creará automáticamente al enviar el formulario."
        selectValidation={{ required: false }}
        nameValidation={{
            required: showNewBrandInput ? "El Nombre de la Marca es obligatorio" : false,
            minLength: { value: 2, message: "El Nombre de la Marca debe tener al menos 2 caracteres" },
            maxLength: { value: 50, message: "El Nombre de la Marca no puede tener más de 50 caracteres" },
        }}
    />
));

BrandSelector.displayName = 'BrandSelector';

export default BrandSelector;
