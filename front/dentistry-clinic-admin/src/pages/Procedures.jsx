import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { Button } from "../components/Button";
import { AddFormModal } from "../components/AddFormModal";
import "../styles/procedures.css";

export function Procedures() {
  const { data: procedures, loading, rerender } = useGetData("procedures");
  const [groupedProcedures, setGroupedProcedures] = useState({});
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);

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
    
    const handleEditClick = () => {}
    const handleDeleteClick = () => { }
    const handleAddClick = () => {
        setIsAddFormModalOpen(true);
    }
    const handleAddFormCloseModal = () => {
        setIsAddFormModalOpen(false);
      };

  const toggleCategory = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

    return (
        <main>
            <header>
                <Button
              buttonText={"ADD PROCEDURE"}
              onClick={handleAddClick}
            />
            </header>
            
            <div className="procedures-container">
      {Object.keys(groupedProcedures).map((category) => (
        <div key={category} className="category">
          <div className="category-header">
            <h2>{category}</h2>
            <i
              className={`fas ${
                expandedCategory === category
                  ? "fa-chevron-circle-up"
                  : "fa-chevron-circle-down"
              }`}
              onClick={() => toggleCategory(category)}
            ></i>
          </div>
          {expandedCategory === category && (
            <ul className="procedure-list">
              {groupedProcedures[category].map((procedure) => (
                <li key={procedure._id} className="procedure-item">
                  <div className="procedure-details">
                    <h3 className="procedure-name">{procedure.name}</h3>
                    <span className="procedure-duration">
                      Duration: {procedure.duration} min
                    </span>
                    <br />
                    <span className="procedure-price">
                      Price: {procedure.price} EUR
                    </span>
                      </div>
                      <div className="procedure-buttons">
                      <Button
              buttonText={"EDIT"}
              onClick={handleEditClick}
            />
            <Button
              buttonText={"DELETE"}
              onClick={handleDeleteClick}
            />
                      </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
                   {isAddFormModalOpen && (
          <AddFormModal
            resource="procedures"
            onClose={handleAddFormCloseModal}
            rerender={rerender}
          />
        )}
    </div></main>
  
  );
}
