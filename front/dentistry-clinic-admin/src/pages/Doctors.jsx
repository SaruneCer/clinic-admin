import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { ItemBox } from "../components/ItemBox";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";

export function Doctors() {
  const { data: allDoctors, loading, rerender } = useGetData("doctors");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {}, [allDoctors]);

  const handleDeleteClick = (doctor) => {
    console.log("Deleting doctor:", doctor);
    rerender();
  };

  const handleEditClick = (doctorId) => {
    console.log("Editing doctor with ID:", doctorId);
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!allDoctors || allDoctors.length === 0) {
    return (
      <main>
        <header>
          <Button buttonText={"+ ADD DOCTOR"} onClick={handleAddClick} />
        </header>
        <p>No doctors available</p>
      </main>
    );
  }

  return (
    <main>
      <header>
        <Button buttonText={"+ ADD DOCTOR"} onClick={handleAddClick} />
      </header>
      <div id="item-box-container">
        {allDoctors.map((doctor) => (
          <ItemBox
            key={doctor._id}
            item={doctor}
            itemType="doctor"
            handleDeleteClick={handleDeleteClick}
            handleEditClick={handleEditClick}
          />
        ))}
      </div>
      {isModalOpen && (
        <AddFormModal
          resource="doctors"
          onClose={handleCloseModal}
          rerender={rerender}
        />
      )}
    </main>
  );
}
