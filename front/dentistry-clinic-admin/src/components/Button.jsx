import "../styles/button.css";

export function Button({ buttonText, onClick }) {
  let className = "basic-button";

  if (buttonText === "DELETE APPOINTMENT") {
    className = "delete-appointment-button";
  }

  return (
    <button className={className} style={{}} type="button" onClick={onClick}>
      {buttonText}
    </button>
  );
}
