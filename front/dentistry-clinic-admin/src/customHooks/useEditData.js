import { useState } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin/";

export function useEditData(resource) {
  const [isLoading, setIsLoading] = useState(false);

  const editData = async (id, formData, actionType) => { 
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${resource}/${id}/${actionType}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("Error editing data:", err);
      setIsLoading(false);
      throw err;
    }
  };

  return { editData, isLoading };
}
