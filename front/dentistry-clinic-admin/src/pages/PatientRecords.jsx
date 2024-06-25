import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { ItemBox } from "../components/ItemBox";
import { useEditData } from "../customHooks/useEditData";
import { EditInfoModal } from "../components/EditInfoModal";
import { useDeleteData } from "../customHooks/useDeleteData";
import { AlertModal } from "../components/AlertModal";
import { useNavigate } from "react-router-dom";
import { AppointmentBox } from "../components/AppointmentBox";
import "../styles/patientRecords.css";

export function PatientRecords() {
  const { patientID } = useParams();
  const [loading, setLoading] = useState(true);
  const {
    data: patient,
    loading: patientLoading,
    rerender,
  } = useGetData(`patients/${patientID}`);
  const { data: appointments, loading: appointmentsLoading } = useGetData(
    `appointments/${patientID}`
  );
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { editData } = useEditData("patients");
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [conditionToEdit, setConditionToEdit] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteData } = useDeleteData();
  const navigate = useNavigate();
  const [conditionToDelete, setConditionToDelete] = useState(null);

  const handleEditPersonalInfoClick = () => {
    setIsEditModalOpen(true);
    setPatientToEdit(patient);
    setIsAddingCondition(false);
    setConditionToEdit(null);
  };

  const handleSave = async (data) => {
    try {
      if (isAddingCondition) {
        const newCondition = {
          conditions: data.conditions,
          notes: data.notes,
        };
        await editData(
          "patients",
          patientToEdit._id,
          newCondition,
          "add-new-condition"
        );
        setIsAddingCondition(false);
      } else if (conditionToEdit) {
        await editData(
          "patients",
          patientToEdit._id,
          {
            ...data,
            conditions: data.conditions,
            notes: data.notes,
          },
          `conditions/${data._id}`
        );
        setConditionToEdit(null);
      } else {
        await editData("patients", patientToEdit._id, data, "info");
      }

      setIsEditModalOpen(false);
      rerender();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEditConditionClick = (condition) => {
    setConditionToEdit(condition);
    setPatientToEdit(patient);
    setIsEditModalOpen(true);
    setIsAddingCondition(false);
  };

  const handleDeletePatientClick = () => {
    setPatientToDelete(patient);
    setIsModalOpen(true);
  };

  const handleDeleteConditionClick = (condition) => {
    setConditionToDelete(condition);
    setPatientToEdit(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (patientToDelete) {
      await deleteData("patients", patientToDelete._id, () => {
        setIsModalOpen(false);
        setPatientToDelete(null);
        navigate("/dentistry-clinic-admin/patients");
      });
    } else if (conditionToDelete) {
      await editData(
        "patients",
        patientToEdit._id,
        conditionToDelete,
        "delete"
      );
      setIsModalOpen(false);
      setConditionToDelete(null);
      rerender();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPatientToDelete(null);
  };

  const handleAddConditionClick = () => {
    setPatientToEdit(patient);
    setIsAddingCondition(true);
    setIsEditModalOpen(true);
    setConditionToEdit(null);
  };

  useEffect(() => {
    setLoading(patientLoading || appointmentsLoading);
  }, [patientLoading, appointmentsLoading]);

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
        <h1 className="patient-name-h1">
          {patient.name} {patient.lastname}
        </h1>
      </header>

      <div>
        <div id="personal-info-container">
          <div className="personal-info-column-wrapper">
            <div className="header-wrapper">
              {" "}
              <h3>Personal Information</h3>
              <div className="buttons-wrapper">
                {" "}
                <Button
                  buttonText={"EDIT INFO"}
                  onClick={handleEditPersonalInfoClick}
                />
                <Button
                  buttonText={"DELETE PATIENT"}
                  onClick={handleDeletePatientClick}
                />
              </div>
            </div>

            <p>
              <strong>Date of Birth:</strong> {patient.dob}
            </p>
            <p>
              <strong>Phone:</strong> {patient.contactInfo.phone}
            </p>
            <p>
              <strong>Email:</strong> {patient.contactInfo.email}
            </p>
            <p>
              <strong>Address:</strong> {patient.address}
            </p>
          </div>

          <div className="personal-info-column-wrapper">
            <div className="header-wrapper">
              {" "}
              <h3>Medical History</h3>
              <div className="buttons-wrapper">
                {" "}
                <Button
                  buttonText={"ADD CONDITION"}
                  onClick={handleAddConditionClick}
                />
              </div>
            </div>

            <div className="medical-condition-wrapper">
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
        </div>
      </div>
      <h3>Appointment history</h3>
      <div id="appointments-container">
        {appointmentsLoading ? (
          <p>Loading appointments...</p>
        ) : (
          <div>
            {appointments.length === 0 ? (
              <p>No appointments found</p>
            ) : (
              appointments.map((appointment) => (
                <AppointmentBox key={appointment._id} item={appointment} />
              ))
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditInfoModal
          dataInfo={isAddingCondition || conditionToEdit ? {} : patient}
          onSave={handleSave}
          onClose={() => setIsEditModalOpen(false)}
          isAddingCondition={isAddingCondition}
          conditionToEdit={conditionToEdit}
        />
      )}
      {isModalOpen && (patientToDelete || conditionToDelete) && (
        <AlertModal
          isOpen={isModalOpen}
          message={
            patientToDelete
              ? `Do you want to delete ${patientToDelete.name}?`
              : `Do you want to delete this condition?`
          }
          onClose={handleCloseModal}
          buttons={[
            {
              label: "Yes",
              className: "confirm-button",
              onClick: handleDelete,
            },
            {
              label: "Cancel",
              className: "cancel-button",
              onClick: handleCloseModal,
            },
          ]}
        />
      )}
    </main>
  );
}
