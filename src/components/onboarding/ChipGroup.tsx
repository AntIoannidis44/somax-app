interface ChipGroupProps {
  options: string[];
  value: string | string[];
  onSelect: (value: string) => void;
}

export function ChipGroup({ options, value, onSelect }: ChipGroupProps) {
  const isSelected = (opt: string) => (Array.isArray(value) ? value.includes(opt) : value === opt);
  return (
    <div className="chip-grid">
      {options.map((opt) => (
        <div
          key={opt}
          className={`chip-opt${isSelected(opt) ? ' sel' : ''}`}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}
