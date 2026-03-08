import { Search } from "lucide-react";

interface SearchBarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ label, value, onChange, placeholder }: SearchBarProps) {
  return (
    <div>
      <label className="block mb-1 text-sm text-neutral-400">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pl-8 bg-neutral-700 text-white text-sm placeholder-neutral-500
            border-t-2 border-l-2 border-neutral-500
            border-b-2 border-r-2 border-b-neutral-800 border-r-neutral-800
            focus:outline-none"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} strokeWidth={1.5} />
      </div>
    </div>
  );
}
