import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { ItemBox } from "../components/ItemBox";

export function PatientRecords() {
  const { patientID } = useParams();
  const [loading, setLoading] = useState(true);
  const { data: patient, loading: patientLoading } = useGetData(
    `patients/${patientID}`
  );

  const handleEditPersonalInfoClick = () => {};

  const handleEditConditionClick = () => {};

  const handleDeleteConditionClick = () => {};

  const handleAddContinionClick = () => {};

  useEffect(() => {
    setLoading(patientLoading);
  }, [patientLoading]);

  if (loading) return <p>Loading...</p>;

  if (!patient || !patient.contactInfo) {
    return <p>Error: Patient data is missing or incomplete.</p>;
  }

  const isMedicalHistoryEmpty =
    !patient.medicalHistory.length ||
    patient.medicalHistory.every(
      (history) => !history.condition && !history.notes
    );

  return (
    <main>
      <header>
        <h1>
          {patient.name} {patient.lastname}
        </h1>
      </header>

      <div>
        <div className="personal-info-container">
          <div className="header-wrapper">
            {" "}
            <h3>Personal Information</h3>
            <Button
              buttonText={"EDIT INFO"}
              onClick={handleEditPersonalInfoClick}
            />{" "}
          </div>

          <p>Date of Birth: {patient.dob}</p>
          <p>Phone: {patient.contactInfo.phone}</p>
          <p>Email: {patient.contactInfo.email}</p>
          <p>Address: {patient.contactInfo.address}</p>
        </div>
        <div className="medical-history-container">
          <div className="header-wrapper">
            {" "}
            <h3>Medical History</h3>
            <Button
              buttonText={"ADD CONDITION"}
              onClick={handleAddContinionClick}
            />
          </div>

          {isMedicalHistoryEmpty ? (
            <p>No medical conditions known.</p>
          ) : (
            patient.medicalHistory.map((history, index) => (
              <ItemBox
                key={index}
                item={history}
                itemType="medical-condition"
                handleDeleteClick={handleDeleteConditionClick}
                handleEditClick={handleEditConditionClick}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
