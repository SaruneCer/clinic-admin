import { Button } from './Button'; 
import { useState } from "react";
import "../styles/edit-info-modal.css";

export function EditInfoModal({ dataInfo, onSave, onClose }) {
  const [editedInfo, setEditedInfo] = useState(dataInfo);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e, parentKey = null) => {
    const { name, value } = e.target;
    if (parentKey) {
      setEditedInfo((prevInfo) => ({
        ...prevInfo,
        [parentKey]: {
          ...prevInfo[parentKey],
          [name]: value,
        },
      }));
    } else {
      setEditedInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value,
      }));
    }
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

  const renderFormFields = (data, parentKey = null) => {
    return Object.keys(data).map((key) => {
      const value = data[key];
      if (key === "_id") {
        return null;
      }
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return renderFormFields(value, key);
      }
      return (
        <div className="edit-form-input" key={key}>
          <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
          <input
            type={typeof value === "number" ? "number" : "text"}
            id={key}
            name={key}
            value={value}
            onChange={(e) => handleChange(e, parentKey)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="modal">
      <div className={`modal-content ${isEditing ? "is-editing" : ""}`}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Edit Information</h2>
        <form className="edit-form">
          {renderFormFields(editedInfo)}
          <div className="modal-buttons">
            <Button buttonText="Save" onClick={handleSave} />
            <Button buttonText="Cancel" onClick={onClose} />
          </div>
        </form>
      </div>
    </div>
  );
}
