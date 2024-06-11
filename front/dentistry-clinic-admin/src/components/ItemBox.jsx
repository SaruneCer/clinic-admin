import { Button } from "../components/Button";

export function ItemBox({ doctor, handleDeleteClick, handleEditClick }) {
  return (
    <>
      <h2>{doctor.name}</h2>
      <p>{doctor.specialization}</p>
      <div className="contact-info-wrapper">
        <p>Email: {doctor.contactInfo.email}</p>
        <p>Phone: {doctor.contactInfo.phone}</p>
      </div>
      <div className="button-container">
        <Button
          buttonText={"EDIT INFO"}
          onClick={() => handleEditClick(doctor._id)}
        />
        <Button
          buttonText={"DELETE"}
          onClick={() => handleDeleteClick(doctor)}
        />
      </div>
    </>
  );
}
