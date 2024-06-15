import { Button } from "./Button";
import { useState } from "react";
import "../styles/edit-info-modal.css";

export function EditInfoModal({
  dataInfo,
  onSave,
  onClose,
  isAddingCondition,
}) {
  const initialInfo = isAddingCondition
    ? { conditions: dataInfo.conditions, notes: dataInfo.notes }
    : dataInfo;
  const [editedInfo, setEditedInfo] = useState(initialInfo);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e = null) => {
    const { name, value } = e.target;
 
      setEditedInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value,
      }));
    
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(editedInfo);
    setIsEditing(false);
  };

  return (
    <div className="modal">
      <div className={`modal-content ${isEditing ? "is-editing" : ""}`}>
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h2>Edit Information</h2>
        <form className="edit-form">
          <div className="edit-form-input">
            <label htmlFor="condition">Conditions:</label>
            <input
              type="text"
              id="conditions"
              name="conditions"
              value={editedInfo.conditions}
              onChange={(e) => handleChange(e)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div className="edit-form-input">
            <label htmlFor="notes">Notes:</label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={editedInfo.notes}
              onChange={(e) => handleChange(e)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div className="modal-buttons">
            <Button buttonText="Save" onClick={handleSave} />
            <Button buttonText="Cancel" onClick={onClose} />
          </div>
        </form>
      </div>
    </div>
  );
}
