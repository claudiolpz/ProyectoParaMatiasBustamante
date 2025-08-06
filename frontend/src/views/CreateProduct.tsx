import { Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useCreateProduct } from "../hooks/useCreateProduct";
import CategorySelector from "../components/CategorySelector";
import ProductFormFields from "../components/ProductForm";
import ErrorMessage from "../components/ErrorMessage";
import {
    CameraOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import type { CreateProductForm } from "../types";

const CreateProduct = () => {
    // Estado para drag & drop
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const {
        form,
        categories,
        loadingCategories,
        showNewCategoryInput,
        handleCreateProduct,
    } = useCreateProduct();

    //  Effect para resetear la imagen cuando el formulario se resetea
    useEffect(() => {
        const subscription = form.watch((value) => {
            // Si todos los campos principales están vacíos, consideramos que se reseteó
            if (!value.name && !value.price && !value.stock && !value.sku) {
                setSelectedFileName(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    //  Manejar drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            const file = files[0];
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp",
            ];

            if (allowedTypes.includes(file.type)) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                const fileInput = document.getElementById("image") as HTMLInputElement;
                if (fileInput) {
                    fileInput.files = dataTransfer.files;
                    setSelectedFileName(file.name);

                    // Trigger change event para react-hook-form
                    const event = new Event("change", { bubbles: true });
                    fileInput.dispatchEvent(event);
                }
            } else {
                toast.error(
                    "Por favor, selecciona solo archivos de imagen (JPEG, PNG, JPG, WEBP)"
                );
            }
        }
    }, []);

    //  Manejar cambio de archivo
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            setSelectedFileName(file ? file.name : null);
        },
        []
    );

    // Manejar eliminación de archivo
    const handleRemoveFile = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const fileInput = document.getElementById("image") as HTMLInputElement;
            if (fileInput) {
                fileInput.value = "";
                setSelectedFileName(null);
                form.setValue("image", undefined as any);
            }
        },
        [form]
    );

    //Función personalizada para manejar el submit
    const onSubmit = useCallback(
        async (data: CreateProductForm) => {
            const success = await handleCreateProduct(data);

            // Si el producto se creó exitosamente, resetear la imagen
            if (success) {
                setSelectedFileName(null);
            }
        },
        [handleCreateProduct]
    );

    // Funciones para obtener clases CSS
    const getInputLabelClasses = useCallback(() => {
        if (isDragOver) return "bg-blue-50 border-blue-500 text-blue-700";
        if (selectedFileName) return "bg-green-50 border-green-300";
        return "bg-slate-100 border-slate-300 hover:bg-slate-200";
    }, [isDragOver, selectedFileName]);

    const getTextClasses = useCallback(() => {
        if (isDragOver) return "text-blue-700";
        if (selectedFileName) return "text-green-700 font-medium";
        return "text-slate-500";
    }, [isDragOver, selectedFileName]);

    const getButtonClasses = useCallback(() => {
        if (isDragOver) return "bg-blue-200 text-blue-800";
        if (selectedFileName) return "bg-green-100 text-green-700";
        return "bg-blue-100 text-blue-700";
    }, [isDragOver, selectedFileName]);

    const getDisplayText = useCallback(() => {
        if (isDragOver) return "¡Suelta la imagen aquí!";
        if (selectedFileName)
            return (
                <div className="flex items-center space-x-2">
                    <div className="bg-green-100 p-1 rounded">
                        <CameraOutlined className="text-green-600" />
                    </div>
                    <div>
                        <div className="font-medium text-green-700">{selectedFileName}</div>
                        <div className="text-xs text-green-600">Archivo seleccionado</div>
                    </div>
                </div>
            );
        return "Seleccionar archivo o arrastra aquí...";
    }, [isDragOver, selectedFileName]);

    const getButtonText = useCallback(() => {
        if (selectedFileName)
            return (
                <span className="flex items-center space-x-1">
                    <CheckCircleOutlined />
                    <span>Seleccionado</span>
                </span>
            );
        if (isDragOver)
            return (
                <span className="flex items-center space-x-1">
                    <CameraOutlined />
                    <span>Soltar</span>
                </span>
            );
        return (
            <span className="flex items-center space-x-1">
                <CameraOutlined />
                <span>Examinar</span>
            </span>
        );
    }, [isDragOver, selectedFileName]);

    return (
        <>
            <h1 className="text-4xl text-white font-bold">Crear Producto</h1>

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
                encType="multipart/form-data"
            >
                {/* 1. Nombre y SKU */}
                <ProductFormFields register={form.register} errors={form.errors} />

                {/* 2. Categoría */}
                <CategorySelector
                    register={form.register}
                    errors={form.errors}
                    categories={categories}
                    loadingCategories={loadingCategories}
                    showNewCategoryInput={showNewCategoryInput}
                />

                {/* 3. Stock */}
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="stock" className="text-2xl text-slate-500">
                        Stock
                    </label>
                    <input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...form.register("stock", {
                            required: "El Stock es obligatorio",
                            min: { value: 0, message: "El Stock debe ser mayor o igual a 0" },
                            valueAsNumber: true,
                        })}
                    />
                    {form.errors.stock && (
                        <ErrorMessage>{form.errors.stock.message}</ErrorMessage>
                    )}
                </div>

                {/* 4. Precio */}
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="price" className="text-2xl text-slate-500">
                        Precio
                    </label>

                    <input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...form.register("price", {
                            required: "El Precio es obligatorio",
                            min: { value: 0, message: "El precio debe ser mayor a 0" },
                            valueAsNumber: true,
                        })}
                    />
                    {form.errors.price && (
                        <ErrorMessage>{form.errors.price.message}</ErrorMessage>
                    )}
                </div>

                {/* 5. Imagen -  Sin botones anidados */}
<div className="grid grid-cols-1 space-y-3">
    <label htmlFor="image" className="text-2xl text-slate-500">
        Imagen del Producto (Opcional)
    </label>

    <div className="relative">
        <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="sr-only"
            {...form.register("image")}
            onChange={handleFileChange}
        />

        {/* SOLUCION: Separar el área de upload del botón eliminar */}
        <div className="space-y-2">
            {/* Área principal de upload */}
            <button
                type="button"
                className={`w-full flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-all duration-200 ${getInputLabelClasses()}`}
                onClick={() => document.getElementById("image")?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="Seleccionar archivo de imagen. Puedes hacer clic o arrastrar archivos aquí"
            >
                <span className={getTextClasses()}>{getDisplayText()}</span>
                <span
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${getButtonClasses()}`}
                >
                    {getButtonText()}
                </span>
            </button>

            {/* Botón eliminar archivo - SEPARADO */}
            {selectedFileName && (
                <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="w-full text-red-500 hover:text-red-700 p-2 flex items-center justify-center space-x-2 text-sm border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar archivo seleccionado"
                >
                    <CloseCircleOutlined />
                    <span>Eliminar "{selectedFileName}"</span>
                </button>
            )}
        </div>

        {isDragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-5 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none"></div>
        )}
    </div>

    <p className="text-xs text-slate-500">
        <PaperClipOutlined /> Formatos aceptados: JPEG, PNG, JPG, WEBP (máx.
        5MB) • Puedes hacer clic o arrastrar
    </p>

    {form.errors.image && (
        <ErrorMessage>{form.errors.image.message}</ErrorMessage>
    )}
</div>

                <input
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 p-3 text-lg w-full uppercase text-white rounded-lg font-bold cursor-pointer transition-colors duration-200"
                    value="Crear Producto"
                />
            </form>

            <nav className="mt-4">
                <Link to="/" className="text-white underline hover:text-blue-200">
                    ← Volver al Inicio
                </Link>
            </nav>
        </>
    );
};

export default CreateProduct;
