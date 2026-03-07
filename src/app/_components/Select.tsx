import { ChevronDown } from "lucide-react";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export default function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  return (
    <div>
      <label className="block mb-1 text-sm text-neutral-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none px-3 py-2 bg-neutral-700 text-white text-sm
            border-t-2 border-l-2 border-neutral-500
            border-b-2 border-r-2 border-b-neutral-800 border-r-neutral-800
            cursor-pointer hover:bg-neutral-600
            active:border-t-neutral-800 active:border-l-neutral-800
            active:border-b-neutral-500 active:border-r-neutral-500
            focus:outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} strokeWidth={1.5} />
      </div>
    </div>
  );
}
