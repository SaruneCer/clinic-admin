import { useState, useEffect } from "react";

export function useSearch(initialData) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    if (!searchValue) {
      setFilteredData(initialData);
      return;
    }

    const filteredItems = initialData.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.lastname.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    setFilteredData(filteredItems);
  }, [searchValue, initialData]);

  return [searchValue, setSearchValue, filteredData];
}
