import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useForm } from 'react-hook-form';
import SelectorWithCreate from '../SelectorWithCreate';
import type { CreateProductForm } from '../../types';

// Wrapper que provee register y errors desde useForm
const Wrapper = ({
    showNewInput = false,
    items = [{ id: 1, name: 'Ropa' }, { id: 2, name: 'Calzado' }],
    loading = false,
    colorScheme = 'blue' as const,
    selectKey = 'categoryId' as const,
    nameKey = 'categoryName' as const,
    label = 'Categoría',
}: Partial<{
    showNewInput: boolean;
    items: { id: number; name: string }[];
    loading: boolean;
    colorScheme: 'blue' | 'green';
    selectKey: 'categoryId' | 'brandId';
    nameKey: 'categoryName' | 'brandName';
    label: string;
}> = {}) => {
    const { register, formState: { errors } } = useForm<CreateProductForm>();
    return (
        <SelectorWithCreate
            register={register}
            errors={errors}
            items={items}
            loading={loading}
            showNewInput={showNewInput}
            selectKey={selectKey}
            nameKey={nameKey}
            label={label}
            colorScheme={colorScheme}
            createLabel={`Crear nueva ${label.toLowerCase()}`}
            newItemLabel={`Nombre de la Nueva ${label}`}
            placeholder={`Seleccionar ${label.toLowerCase()}`}
            loadingPlaceholder={`Cargando ${label.toLowerCase()}s...`}
            helpText="Se creará automáticamente al enviar el formulario."
        />
    );
};

describe('SelectorWithCreate', () => {
    it('renderiza el label correctamente', () => {
        render(<Wrapper label="Categoría" />);
        expect(screen.getByText('Categoría')).toBeInTheDocument();
    });

    it('renderiza las opciones de la lista', () => {
        render(<Wrapper items={[{ id: 1, name: 'Ropa' }, { id: 2, name: 'Calzado' }]} />);
        expect(screen.getByRole('option', { name: 'Ropa' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Calzado' })).toBeInTheDocument();
    });

    it('muestra opción de crear nuevo', () => {
        render(<Wrapper label="Categoría" />);
        expect(screen.getByRole('option', { name: 'Crear nueva categoría' })).toBeInTheDocument();
    });

    it('muestra placeholder de selección cuando no está cargando', () => {
        render(<Wrapper label="Categoría" loading={false} />);
        expect(screen.getByRole('option', { name: 'Seleccionar categoría' })).toBeInTheDocument();
    });

    it('muestra placeholder de carga cuando loading=true', () => {
        render(<Wrapper label="Categoría" loading={true} />);
        expect(screen.getByRole('option', { name: 'Cargando categorías...' })).toBeInTheDocument();
    });

    it('deshabilita el select cuando loading=true', () => {
        render(<Wrapper loading={true} />);
        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('habilita el select cuando loading=false', () => {
        render(<Wrapper loading={false} />);
        expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('NO muestra el input de nuevo item cuando showNewInput=false', () => {
        render(<Wrapper showNewInput={false} label="Categoría" />);
        expect(screen.queryByText('Nombre de la Nueva Categoría')).not.toBeInTheDocument();
    });

    it('muestra el input de nuevo item cuando showNewInput=true', () => {
        render(<Wrapper showNewInput={true} label="Categoría" />);
        expect(screen.getByText('Nombre de la Nueva Categoría')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('muestra el helpText cuando showNewInput=true', () => {
        render(<Wrapper showNewInput={true} />);
        expect(screen.getByText('Se creará automáticamente al enviar el formulario.')).toBeInTheDocument();
    });

    it('funciona con colorScheme green (Marca)', () => {
        render(<Wrapper selectKey="brandId" nameKey="brandName" label="Marca" colorScheme="green" showNewInput={true} />);
        expect(screen.getByText('Nombre de la Nueva Marca')).toBeInTheDocument();
    });

    it('renderiza sin items sin errores', () => {
        render(<Wrapper items={[]} />);
        // Solo debe aparecer el placeholder y la opción de crear
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.queryAllByRole('option')).toHaveLength(2); // placeholder + crear nuevo
    });

    it('el usuario puede seleccionar una opción', async () => {
        const user = userEvent.setup();
        render(<Wrapper items={[{ id: 1, name: 'Ropa' }]} />);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, '1');

        expect((select as HTMLSelectElement).value).toBe('1');
    });
});
