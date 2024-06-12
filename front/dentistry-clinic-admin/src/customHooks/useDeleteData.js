import { useState } from "react";

export function useDeleteData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteData = async (url, idToDelete, setData) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/${idToDelete}`, {
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
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteData };
}
