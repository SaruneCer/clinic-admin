import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetData } from "../customHooks/useGetData";

export function PatientRecords() {
  const { patientID } = useParams();
  console.log(patientID);
  const [loading, setLoading] = useState(true);
  const { data: patient, loading: patientLoading } = useGetData(
    `patients/${patientID}`
  );

  useEffect(() => {
    setLoading(patientLoading);
  }, [patientLoading]);

  if (loading) return <p>Loading...</p>;

  if (!patient || !patient.contactInfo) {
    return <p>Error: Patient data is missing or incomplete.</p>;
  }

  return (
    <main>
      <h1>Patient Records</h1>
      <div>
        <h2>
          Name: {patient.name} {patient.lastname}
        </h2>
        <p>Date of Birth: {patient.dob}</p>
        <p>Phone: {patient.contactInfo.phone}</p>
        <p>Email: {patient.contactInfo.email}</p>
        <p>Address: {patient.contactInfo.address}</p>
        <h3>Medical History:</h3>
        <ul>
          {patient.medicalHistory?.length ? (
            patient.medicalHistory.map((history, index) => (
              <li key={index}>
                <strong>Condition:</strong>{" "}
                {history.conditions ? history.conditions : "none"}
                <br />
                <strong>Notes:</strong> {history.notes ? history.notes : "none"}
              </li>
            ))
          ) : (
            <li>No medical history available.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
