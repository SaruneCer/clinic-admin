import "../styles/button.css";

export function Button({ buttonText, onClick }) {
  const isDeleteOrCancel = buttonText === "DELETE" || buttonText === "Cancel";

  return (
    <button
      className={isDeleteOrCancel ? "delete-cancel-button" : "basic-button"}
      style={{}}
      type="button"
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
}
