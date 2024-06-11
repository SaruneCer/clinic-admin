import { useState } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin/";

export function usePostData(resource) {
  const [isLoading, setIsLoading] = useState(false);

  const postData = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setIsLoading(false);
      return await response.json();
    } catch (err) {
      console.error("Error posting data:", err);
      setIsLoading(false);
      throw err;
    }
  };

  return { postData, isLoading };
}
