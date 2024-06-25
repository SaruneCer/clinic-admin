import { useState } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin";

export function useEditData() {
  const [isLoading, setIsLoading] = useState(false);

  const editData = async (resource, item, formData, actionType) => {
    setIsLoading(true);
    try {
      let url;
      let method = "PATCH";
      let headers = {
        "Content-Type": "application/json",
      };

      if (actionType === "add-new-condition" || actionType === "info") {
        url = `${BASE_URL}/${resource}/${item}/${actionType}`;
      } else if (actionType === "delete") {
        url = `${BASE_URL}/${resource}/${item}/conditions/${formData}/delete`;
        method = "PATCH";  
      } else {
        url = `${BASE_URL}/${resource}/${item}/conditions/${formData._id}/edit`;
      }

      const fetchOptions = {
        method: method,
        headers: headers,
      };

      if (actionType !== "delete") {
        fetchOptions.body = JSON.stringify(formData);
      }

      const response = await fetch(url, fetchOptions);

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
