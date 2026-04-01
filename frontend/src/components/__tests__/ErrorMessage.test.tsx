import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
    it('renderiza el mensaje recibido', () => {
        render(<ErrorMessage>El campo es obligatorio</ErrorMessage>);
        expect(screen.getByText(/El campo es obligatorio/)).toBeInTheDocument();
    });

    it('incluye el prefijo *', () => {
        render(<ErrorMessage>Error de validación</ErrorMessage>);
        expect(screen.getByText(/\*/)).toBeInTheDocument();
    });

    it('renderiza como un párrafo', () => {
        render(<ErrorMessage>Mensaje</ErrorMessage>);
        expect(screen.getByRole('paragraph')).toBeInTheDocument();
    });

    it('acepta contenido string vacío sin romper', () => {
        render(<ErrorMessage>{''}</ErrorMessage>);
        expect(screen.getByRole('paragraph')).toBeInTheDocument();
    });

    it('acepta nodos React como children', () => {
        render(<ErrorMessage><span>Error en span</span></ErrorMessage>);
        expect(screen.getByText('Error en span')).toBeInTheDocument();
    });
});
