import React from 'react';
import '../styles/ConfirmDialog.css';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button 
            className="confirm-btn-cancel" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="confirm-btn-confirm" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
