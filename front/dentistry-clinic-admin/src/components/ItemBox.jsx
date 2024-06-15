import { Button } from "../components/Button";
import "../styles/item-box.css";

export function ItemBox({
  item,
  itemType,
  handleDeleteClick,
  handleEditClick,
}) {
  return (
    <div className="item-box">
      {item.name && <h2>{item.name}</h2>}
      
      {itemType === "doctor" && (
        <>
          <p className="specialization">{item.specialization}</p>
          <div className="contact-info-container">
            <div className="contact-info-wrapper">
              <div className="icon-wrapper">
                <i className="fas fa-envelope"></i>
              </div>
              <p className="contact-info">{item.contactInfo.email}</p>
            </div>
            <div className="contact-info-wrapper">
              <div className="icon-wrapper">
                <i className="fas fa-phone"></i>
              </div>
              <p className="contact-info">{item.contactInfo.phone}</p>
            </div>
          </div>
        </>
      )}
      
      {itemType === "procedure" && (
        <>
          <p>Duration: {item.duration} minutes</p>
          <p>Price: ${item.price}</p>
        </>
      )}
      
      {itemType === "medical-condition" && (
        <>
          <p><strong>Condition:</strong> {item.conditions}</p>
          <p><strong>Notes:</strong> {item.notes}</p>
        </>
      )}
      
      <div className="button-container">
        <Button
          buttonText={"EDIT"}
          onClick={() => handleEditClick(item._id)}
        />
        <Button buttonText={"DELETE"} onClick={() => handleDeleteClick(item)} />
      </div>
    </div>
  );
}
