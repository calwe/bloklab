interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-2 text-sm bg-neutral-700 text-white
        border-t-2 border-l-2 border-neutral-500
        border-b-2 border-r-2 border-b-neutral-800 border-r-neutral-800
        hover:bg-neutral-600
        active:border-t-neutral-800 active:border-l-neutral-800
        active:border-b-neutral-500 active:border-r-neutral-500
        cursor-pointer"
    >
      {children}
    </button>
  );
}
