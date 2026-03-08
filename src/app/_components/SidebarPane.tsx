'use client';

import { useEffect, useState } from 'react';

interface SidebarPaneProps {
  icon: React.ReactNode;
  shortcut?: string;
  width: string;
  children: React.ReactNode;
}

export default function SidebarPane({ icon, shortcut, width, children }: SidebarPaneProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!shortcut) return;
    const handler = (e: KeyboardEvent) => {
      const t = e.target;
      if (e.key.toLowerCase() === shortcut.toLowerCase() &&
          !(t instanceof HTMLInputElement) &&
          !(t instanceof HTMLSelectElement) &&
          !(t instanceof HTMLTextAreaElement))
        setIsOpen(v => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut]);

  return (
    <div
      className="flex items-start transition-transform duration-200 ease-in-out"
      style={{ transform: isOpen ? 'translateX(0)' : `translateX(${width})` }}
    >
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative translate-x-[1.5px] p-1.5 bg-neutral-900 text-neutral-400
          border-t-2 border-l-2 border-b-2 border-r-0 border-neutral-600"
        style={{ zIndex: 1 }}
      >
        {icon}
      </button>
      {children}
    </div>
  );
}
