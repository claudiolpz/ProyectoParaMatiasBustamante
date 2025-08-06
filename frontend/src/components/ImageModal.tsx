import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import type { ImageModalProps } from "../types";

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Manejar teclas del teclado globalmente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus en el modal cuando se abre
      modalRef.current?.focus();
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Modal de imagen"
      tabIndex={-1}
    >
      <div 
        className="relative max-w-4xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-2 text-white hover:text-gray-300 text-2xl z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded p-2 bg-black bg-opacity-50"
          aria-label="Cerrar modal de imagen"
          type="button"
          autoFocus
        >
          <CloseOutlined />
        </button>
        
        {/* Contenedor con fondo negro para la imagen */}
        <div className="bg-white rounded-lg p-4 shadow-2xl">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-[90vh] object-contain rounded"
          />
        </div>
      </div>
      
      {/* Área invisible para capturar clicks del backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default ImageModal;