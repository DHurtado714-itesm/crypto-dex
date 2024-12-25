import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ChangeEvent } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchBar = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}: SearchBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="search-container">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        prefix={<SearchOutlined className="search-icon" />}
        className={`custom-search-input ${className}`}
      />
    </div>
  );
};

export default SearchBar;
