import { useState } from "react";

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
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return (
          <fieldset key={key} className="nested-fieldset">
            <legend>{key}</legend>
            {renderFormFields(value, key)}
          </fieldset>
        );
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
    });
  };

  return (
    <div className="modal">
      <div className={`modal-content ${isEditing ? "is-editing" : ""}`}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Edit Information</h2>
        <form className="edit-form">
          {renderFormFields(editedInfo)}
          <div className="modal-buttons">
            <button
              type="button"
              className="button confirm-button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="button cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
