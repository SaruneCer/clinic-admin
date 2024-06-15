import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { ItemBox } from "../components/ItemBox";
import { useEditData } from "../customHooks/useEditData";
import { EditInfoModal } from "../components/EditInfoModal";

export function PatientRecords() {
  const { patientID } = useParams();
  const [loading, setLoading] = useState(true);
  const {
    data: patient,
    loading: patientLoading,
    rerender,
  } = useGetData(`patients/${patientID}`);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { editData } = useEditData("patients");
  const [isAddingCondition, setIsAddingCondition] = useState(false);

  const handleEditPersonalInfoClick = () => {
    setIsEditModalOpen(true);
    setPatientToEdit(patient);
  };

  const handleSave = async (data) => {
    try {
      if (isAddingCondition) {
        const newCondition = {
          conditions: data.conditions,
          notes: data.notes,
        };
        await editData(patientToEdit._id, newCondition, "add-new-condition");

        setIsAddingCondition(false);
      } else {
        await editData(patientToEdit._id, data, "info");
      }

      setIsEditModalOpen(false);
      rerender();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEditConditionClick = () => {};

  const handleDeleteConditionClick = () => {};

  const handleAddContinionClick = () => {
    setPatientToEdit(patient);
    setIsAddingCondition(true);
    setIsEditModalOpen(true);
  };

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
      (history) => !history.conditions && !history.notes
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
      {isEditModalOpen && (
        <EditInfoModal
          dataInfo={isAddingCondition ? {} : patient}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
          isAddingCondition={isAddingCondition}
        />
      )}
    </main>
  );
}
