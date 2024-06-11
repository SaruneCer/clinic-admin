import "../styles/button.css";

export function Button({ buttonText, onClick }) {
  return (
    <button className="basic-button" style={{}} type="button" onClick={onClick}>
      {buttonText}
    </button>
  );
}
