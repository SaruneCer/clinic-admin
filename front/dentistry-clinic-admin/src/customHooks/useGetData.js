import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:8080/dentistry_clinic_admin/";

export function useGetData(resource) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${resource}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      if (Array.isArray(result)) {
        const validData = result.filter((item) => {
          if (resource === "doctors" || resource === "patients") {
            return (
              item.name && item.contactInfo?.email && item.contactInfo?.phone
            );
          } else if (resource === "procedures") {
            return item.name && item.duration && item.price;
          } else if (resource === "appointments") {
            return (
              item.doctorName &&
              item.patientName &&
              item.procedureName &&
              item.report
            );
          } else if (resource === "schedules") {
            return (
              item.title &&
              item.start &&
              item.end &&
              item.doctorID &&
              item.data?.procedure &&
              item.data?.comment
            );
          }
          return true;
        });
        setData(validData);
      } else {
        setData(result);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rerender = () => {
    fetchData();
  };

  return { data, loading, setData, rerender };
}
