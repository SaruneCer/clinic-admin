import { useState } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin/";

export function useDeleteData() {
  const [error, setError] = useState(null);

  const deleteData = async (resource, idToDelete, setData) => {
    try {
      const response = await fetch(`${BASE_URL}${resource}/${idToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      setData((prevData) => prevData.filter((item) => item.id !== idToDelete));
    } catch (error) {
      setError(error);
    }
  };

  return { error, deleteData };
}
