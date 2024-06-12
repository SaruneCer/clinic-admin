import { Button } from "../components/Button"; 

export function Modal({ isOpen, message, onClose, buttons }) {
  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={onClose}>
              &times;
            </span>
            <p>{message}</p>
            {buttons && buttons.length > 0 && (
              <div className="modal-buttons">
                {buttons.map((button, index) => (
                  <Button
                    key={index}
                    className={button.className}
                    onClick={button.onClick}
                    buttonText={button.label} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}