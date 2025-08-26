import React, { useState, useEffect, useRef } from 'react';

interface DateInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, placeholder, className }) => {
  const [displayValue, setDisplayValue] = useState('');
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Convertir valor interno (yyyy-mm-dd) a formato display (dd/mm/yyyy)
  const formatToDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convertir formato display (dd/mm/yyyy) a valor interno (yyyy-mm-dd)
  const formatToISO = (displayDate: string): string => {
    if (!displayDate || displayDate.length !== 10) return '';
    const [day, month, year] = displayDate.split('/');
    if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
    
    // Validar que sea una fecha válida
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (date.getFullYear() !== parseInt(year) || 
        date.getMonth() !== parseInt(month) - 1 || 
        date.getDate() !== parseInt(day)) {
      return '';
    }
    
    return `${year}-${month}-${day}`;
  };

  // Actualizar display cuando cambie el valor
  useEffect(() => {
    setDisplayValue(formatToDisplay(value || ''));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d]/g, ''); // Solo números
    
    // Aplicar máscara dd/mm/yyyy
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2);
    }
    if (input.length >= 5) {
      input = input.substring(0, 5) + '/' + input.substring(5);
    }
    if (input.length > 10) {
      input = input.substring(0, 10);
    }

    setDisplayValue(input);

    // Solo enviar onChange si es una fecha completa y válida
    if (input.length === 10) {
      const isoDate = formatToISO(input);
      if (isoDate) {
        onChange(isoDate);
      }
    } else if (input.length === 0) {
      onChange('');
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    onChange(isoDate);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y edición
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || e.key === 'Tab' || e.key === 'Enter') {
      return;
    }
    
    // Solo permitir números
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleIconClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.showPicker();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'DD/MM/YYYY'}
        className={`${className} pr-10`}
        maxLength={10}
      />
      
      {/* Input de fecha oculto para el selector nativo */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value || ''}
        onChange={handleDatePickerChange}
        className="absolute opacity-0 pointer-events-none"
        tabIndex={-1}
      />
      
      {/* Icono de calendario */}
      <button
        type="button"
        onClick={handleIconClick}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      </button>
    </div>
  );
};

export default DateInput;
