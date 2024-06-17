import { useState } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin";

export function useEditData() {
  const [isLoading, setIsLoading] = useState(false);

  const editData = async (resource, item, formData, actionType) => {
    setIsLoading(true);
    try {
      let url;

      if (actionType === "add-new-condition") {
        url = `${BASE_URL}/${resource}/${item}/${actionType}`;
      } else if (actionType === "info") {
        url = `${BASE_URL}/${resource}/${item}/${actionType}`;
      } else {
        url = `${BASE_URL}/${resource}/${item}/conditions/${formData._id}`;
      }

      const response = await fetch(url, {
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
