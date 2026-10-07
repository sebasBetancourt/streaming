interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function GenreChips({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-7">
      {options.map((g) => (
        <div
          key={g}
          role="button"
          tabIndex={0}
          onClick={() => onChange(g)}
          className={`h-8 select-none content-center rounded-full border px-3 py-1 text-sm transition ${
            value === g ? "border-white/70 bg-white/20" : "border-white/15 bg-white/5 hover:bg-white/10"
          }`}
        >
          {g}
        </div>
      ))}
    </div>
  );
}
