import { Link } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";
import { useState } from "react";
import { useSearch } from "../customHooks/useSearch";
import { SearchInput } from "../components/SearchInput";
import "../styles/patients.css";

export function Patients() {
  const { data: patients, loading, rerender } = useGetData("patients");
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
  const [searchValue, setSearchValue, filteredPatients] = useSearch(patients);

  if (loading) {
    return <div>Loading...</div>;
  }

  patients.sort((a, b) => a.lastname.localeCompare(b.lastname));

  const groupedPatients = filteredPatients.reduce((acc, patient) => {
    const firstLetter = patient.lastname[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(patient);
    return acc;
  }, {});

  const letters = Object.keys(groupedPatients);

  const patientElements = Object.entries(groupedPatients).map(
    ([letter, patients]) => (
      <div
        key={`group-${letter}`}
        id={`section-${letter}`}
        className="patient-group"
      >
        <div className="letter-header">
          <h2>{letter}</h2>
        </div>
        <div className="patient-names">
          {patients.map((patient) => (
            <div key={`patient-${patient._id}`} className="patient-item">
              <Link
                className="patient-name-link"
                to={`/dentistry-clinic-admin/patient-records/${patient._id}`}
              >
                {patient.name} {patient.lastname}
              </Link>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const handleLetterClick = (letter) => {
    const targetSection = document.getElementById(`section-${letter}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddClick = () => {
    setIsAddFormModalOpen(true);
  };

  const handleAddFormCloseModal = () => {
    setIsAddFormModalOpen(false);
  };

  return (
    <main>
      <header>
        <Button buttonText={"+ ADD PATIENT"} onClick={handleAddClick} />
        <SearchInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </header>
      <div className="alphabet-nav">
        {letters.map((letter) => (
          <button
            key={`nav-${letter}`}
            onClick={() => handleLetterClick(letter)}
            className="nav-button"
          >
            {letter}
          </button>
        ))}
      </div>
      <div id="patient-list-container">
        <div className="alphabetical-section">{patientElements}</div>
        {isAddFormModalOpen && (
          <AddFormModal
            resource="patients"
            onClose={handleAddFormCloseModal}
            rerender={rerender}
          />
        )}
      </div>
    </main>
  );
}
