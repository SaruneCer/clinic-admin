import { Link } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";
import { useState } from "react";

export function Patients() {
    const { data: patients, loading, rerender } = useGetData("patients");
    const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  patients.sort((a, b) => a.lastname.localeCompare(b.lastname));

  let currentLetter = null;
  const patientElements = [];

  patients.forEach((patient, index) => {
    const lastName = patient.lastname;
    const firstLetter = lastName[0].toUpperCase();
    let header = null;

    if (firstLetter !== currentLetter) {
      header = <h2 key={`header-${firstLetter}`}>{firstLetter}</h2>;
      currentLetter = firstLetter;
      patientElements.push(header);
    }

    patientElements.push(
      <Link
        key={`link-${index}`}
        to={`/dentistry-clinic-admin/patient-records/${patient._id.$oid}`}
      >
        {patient.name} {patient.lastname}
      </Link>,
      <br key={`br-${index}`} />
    );
  });
    
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
      </header>
          <div>{patientElements}</div>
          {isAddFormModalOpen && (
        <AddFormModal
          resource="patients"
          onClose={handleAddFormCloseModal}
          rerender={rerender}
        />
      )}
    </main>
  );
}
