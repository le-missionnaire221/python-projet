import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title = 'Confirmer la suppression',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="card mb-0">
            <div className="card-header pb-0 pt-3 px-4">
              <h6 className="font-weight-bolder mb-0">{title}</h6>
            </div>
            <div className="card-body px-4 py-3">
              <p className="text-sm mb-0">{message}</p>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2 px-4 pb-3 pt-0 border-0">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mb-0"
                onClick={onCancel}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn bg-gradient-danger btn-sm mb-0"
                onClick={onConfirm}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
