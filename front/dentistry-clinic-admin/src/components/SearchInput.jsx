export function SearchInput({ searchValue, setSearchValue }) {
    const handleChange = (e) => {
      setSearchValue(e.target.value);
    };
  
    return (
      <div className="search-input-container">
       
          <input
            type="text"
            id="search-input"
                    value={searchValue}
                    placeholder="Search"
            onChange={handleChange}
          ></input>
        
      </div>
    );
  }