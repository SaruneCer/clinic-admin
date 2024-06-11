import { useGetData } from "../customHooks/useGetData";
import { ItemBox } from "../components/ItemBox";
import { useEffect } from "react";

export function Doctors() {
  const { data: allDoctors, loading, rerender } = useGetData("doctors");
  console.log("Data:", allDoctors);

  useEffect(() => {}, [allDoctors]);

  const handleDeleteClick = (doctor) => {
    console.log("Deleting doctor:", doctor);

    rerender();
  };

  const handleEditClick = (doctorId) => {
    console.log("Editing doctor with ID:", doctorId);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!allDoctors || allDoctors.length === 0) {
    return <p>No doctors available</p>;
  }

  return (
    <main>
      {allDoctors.map((doctor) => (
        <ItemBox
          key={doctor._id}
          item={doctor}
          itemType="doctor"
          handleDeleteClick={handleDeleteClick}
          handleEditClick={handleEditClick}
        />
      ))}
    </main>
  );
}
