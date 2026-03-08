import { Html } from '@react-three/drei';

interface SelectionPopupProps {
  position: [number, number, number];
  children: React.ReactNode;
}

export default function SelectionPopup({ position, children }: SelectionPopupProps) {
  return (
    <Html position={position} style={{ transform: 'translate(20px, -50%)' }} zIndexRange={[10, 10]}>
      <div className="hidden lg:block bg-neutral-900 border-2 border-neutral-600 text-white w-72 text-sm">
        {children}
      </div>
    </Html>
  );
}
