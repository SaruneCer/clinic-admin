import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { ItemBox } from "../components/ItemBox";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";
import { useDeleteData } from "../customHooks/useDeleteData";
import { AlertModal } from "../components/AlertModal";
import { EditInfoModal } from "../components/EditInfoModal";
import { useEditData } from "../customHooks/useEditData";

export function Doctors() {
  const { data: allDoctors, loading, rerender } = useGetData("doctors");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const { editData} = useEditData("doctors");

  const { deleteData } = useDeleteData();

  useEffect(() => {}, [allDoctors]);

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (doctorToDelete) {
      await deleteData("doctors", doctorToDelete._id, () => rerender());
      setIsModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDoctorToDelete(null);
  };

  const handleAddClick = () => {
    setIsAddFormModalOpen(true);
  };

  const handleAddFormCloseModal = () => {
    setIsAddFormModalOpen(false);
  };

  const handleEditClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };
    
    
  const handleSave = async (editedInfo) => {
    try {
      await editData(selectedDoctor._id, editedInfo);
      setIsModalOpen(false);
      setSelectedDoctor(null);
      rerender(); 
    } catch (error) {
      console.error("Error editing doctor:", error);
    }
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
            handleEditClick={() => handleEditClick(doctor)}
          />
        ))}
      </div>
      {selectedDoctor && (
      <EditInfoModal
      dataInfo={selectedDoctor}
      onSave={handleSave} 
      onClose={() => {
        setSelectedDoctor(null);
        setIsModalOpen(false);
      }}
      resource="doctors"
    />
      )}
      {isModalOpen && doctorToDelete && (
        <AlertModal
          isOpen={isModalOpen}
          message={`Do you want to delete ${doctorToDelete.name}?`}
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
      {isAddFormModalOpen && (
        <AddFormModal
          resource="doctors"
          onClose={handleAddFormCloseModal}
          rerender={rerender}
        />
      )}
    </main>
  );
}
