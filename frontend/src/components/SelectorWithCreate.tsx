import { memo } from "react";
import type { UseFormRegister, FieldErrors, RegisterOptions } from "react-hook-form";
import type { CreateProductForm } from "../types";
import ErrorMessage from "./ErrorMessage";

type SelectKey = 'categoryId' | 'brandId';
type NameKey = 'categoryName' | 'brandName';

const colorMap = {
    blue: {
        container: 'bg-blue-50 border-2 border-blue-200',
        input: 'bg-white border-2 border-blue-300 p-3 rounded-lg placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
        help: 'text-blue-600',
    },
    green: {
        container: 'bg-green-50 border-2 border-green-200',
        input: 'bg-white border-2 border-green-300 p-3 rounded-lg placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-200',
        help: 'text-green-600',
    },
} as const;

interface SelectorWithCreateProps {
    register: UseFormRegister<CreateProductForm>;
    errors: FieldErrors<CreateProductForm>;
    items: { id: number; name: string }[];
    loading: boolean;
    showNewInput: boolean;
    selectKey: SelectKey;
    nameKey: NameKey;
    label: string;
    colorScheme: 'blue' | 'green';
    createLabel: string;
    newItemLabel: string;
    placeholder: string;
    loadingPlaceholder: string;
    helpText: string;
    selectValidation?: RegisterOptions;
    nameValidation?: RegisterOptions;
}

const SelectorWithCreate = memo(({
    register,
    errors,
    items,
    loading,
    showNewInput,
    selectKey,
    nameKey,
    label,
    colorScheme,
    createLabel,
    newItemLabel,
    placeholder,
    loadingPlaceholder,
    helpText,
    selectValidation,
    nameValidation,
}: SelectorWithCreateProps) => {
    const colors = colorMap[colorScheme];

    return (
        <>
            <div className="grid grid-cols-1 space-y-3">
                <label htmlFor={selectKey} className="text-2xl text-slate-500">
                    {label}
                </label>
                <div className="relative">
                    <select
                        id={selectKey}
                        className="bg-slate-100 border-none p-3 rounded-lg appearance-none w-full pr-10"
                        {...(register as any)(selectKey, selectValidation)}
                        disabled={loading}
                    >
                        <option value="">
                            {loading ? loadingPlaceholder : placeholder}
                        </option>
                        {items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                        <option value="0">{createLabel}</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {errors[selectKey] && (
                    <ErrorMessage>{errors[selectKey]?.message}</ErrorMessage>
                )}
            </div>

            {showNewInput && (
                <div className={`grid grid-cols-1 space-y-3 ${colors.container} p-4 rounded-lg transition-all duration-300`}>
                    <label htmlFor={nameKey} className="text-2xl text-slate-500 flex items-center">
                        {newItemLabel}
                    </label>
                    <input
                        id={nameKey}
                        type="text"
                        placeholder={`Ingresa el nombre de la nueva ${label.toLowerCase()}`}
                        className={colors.input}
                        {...(register as any)(nameKey, nameValidation)}
                    />
                    {errors[nameKey] && (
                        <ErrorMessage>{errors[nameKey]?.message}</ErrorMessage>
                    )}
                    <p className={`text-sm ${colors.help}`}>{helpText}</p>
                </div>
            )}
        </>
    );
});

SelectorWithCreate.displayName = 'SelectorWithCreate';

export default SelectorWithCreate;
