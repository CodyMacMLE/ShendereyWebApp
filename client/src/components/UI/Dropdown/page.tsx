'use client'

import { useRef } from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';

// Types for the dropdown
type DropdownProps = {
  items: {
    id: number,
    name: string
  }[],
  setSelected: React.Dispatch<React.SetStateAction<{
    id: number,
    name: string
  }>>,
    selected: {
    id: number,
    name: string
  },
}

export default function Dropdown({ items, setSelected, selected }: DropdownProps) {

  // For custom chevron placement
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <div className="w-full">
      <div className="relative mt-2">
        <select
          ref={selectRef}
          className="appearance-none h-[38px] grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-black outline outline-1 -outline-offset-1 outline-[var(--border)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6"
          value={selected.id}
          onChange={e => {
            const item = items.find(i => i.id === Number(e.target.value));
            if (item) setSelected(item);
          }}
        >
          {items.map(item => (
            <option
              key={item.id}
              value={item.id}
              className="text-[var(--foreground)] font-normal"
            >
              {item.name}
            </option>
          ))}
        </select>
        <ChevronUpDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-black sm:size-4"
        />
      </div>
    </div>
  );
}
