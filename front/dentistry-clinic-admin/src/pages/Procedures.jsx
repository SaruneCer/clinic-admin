import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";
import { useEditData } from "../customHooks/useEditData";
import { EditInfoModal } from "../components/EditInfoModal";
import { useDeleteData } from "../customHooks/useDeleteData";
import { AlertModal } from "../components/AlertModal";
import "../styles/procedures.css";

export function Procedures() {
  const { data: procedures, loading, rerender } = useGetData("procedures");
  const [groupedProcedures, setGroupedProcedures] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
  const [procedureToEdit, setProcedureToEdit] = useState(null);
  const [procedureToDelete, setProcedureToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { editData } = useEditData();
  const { deleteData } = useDeleteData();

  useEffect(() => {
    if (procedures) {
      const grouped = {};
      procedures.forEach((procedure) => {
        const { category } = procedure;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(procedure);
      });
      setGroupedProcedures(grouped);
    }
  }, [procedures]);

  const handleEditClick = (procedure) => {
    setIsEditModalOpen(true);
    setProcedureToEdit(procedure);
  };

  const handleDeleteClick = (procedure) => {
    setProcedureToDelete(procedure);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (procedureToDelete) {
      await deleteData("procedures", procedureToDelete, () => rerender());
      setIsModalOpen(false);
      setProcedureToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProcedureToDelete(null);
  };

  const handleAddClick = () => {
    setIsAddFormModalOpen(true);
  };

  const handleAddFormCloseModal = () => {
    setIsAddFormModalOpen(false);
  };

  const handleSave = async (data) => {
    try {
      await editData("procedures", procedureToEdit._id, data, "info");
      setIsEditModalOpen(false);
      setProcedureToEdit(null);
      rerender();
    } catch (error) {
      console.error("Error editing procedure:", error);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategory((prevCategory) => (prevCategory === category ? null : category));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <header>
        <Button buttonText={"+ ADD PROCEDURE"} onClick={handleAddClick} />
      </header>
      <div className="procedures-container">
        <div className="procedures-wrapper">
          {Object.keys(groupedProcedures).map((category) => (
            <div key={category} className="category">
              <div
                className={
                  expandedCategory === category
                    ? "active-category-header"
                    : "category-header"
                }
                onClick={() => toggleCategory(category)}
              >
                <h2 className="category-title">{category}</h2>
                <i
                  className={`fas ${
                    expandedCategory === category
                      ? "fa-chevron-circle-up"
                      : "fa-chevron-circle-down"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    toggleCategory(category);
                  }}
                ></i>
              </div>
              {expandedCategory === category && (
                <ul className="procedure-list">
                  {groupedProcedures[category].map((procedure) => (
                    <li key={procedure._id} className="procedure-item">
                      <h3 className="procedure-name">{procedure.name}</h3>
                      <div className="procedure-details">
                        <span className="procedure-duration">
                          <i className="fas fa-clock"></i> {procedure.duration}{" "}
                          min
                        </span>
                        <br />
                        <span className="procedure-price">
                          <i className="fas fa-money-bill-wave"></i>{" "}
                          {procedure.price} EUR
                        </span>
                      </div>
                      <div className="procedure-buttons">
                        <Button
                          buttonText={"EDIT"}
                          onClick={() => handleEditClick(procedure)}
                        />
                        <Button
                          buttonText={"DELETE"}
                          onClick={() => handleDeleteClick(procedure._id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {procedureToEdit && isEditModalOpen && (
            <EditInfoModal
              dataInfo={procedureToEdit}
              onSave={handleSave}
              onClose={() => {
                setProcedureToEdit(null);
                setIsEditModalOpen(false);
              }}
              existingCategories={Object.keys(groupedProcedures)}
            />
          )}
          {isAddFormModalOpen && (
            <AddFormModal
              resource="procedures"
              onClose={handleAddFormCloseModal}
              rerender={rerender}
            />
          )}
          {isModalOpen && procedureToDelete && (
            <AlertModal
              isOpen={isModalOpen}
              message={`Do you want to delete ${procedureToDelete.name} procedure?`}
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
        </div>
      </div>
    </main>
  );
}
