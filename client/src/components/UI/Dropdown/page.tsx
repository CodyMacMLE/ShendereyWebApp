'use client'

import { useState } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

export default function Dropdown(
    { items, setItem, currentItem }: {
        items: string[], 
        setItem: React.Dispatch<React.SetStateAction<string>>,
        currentItem?: string, 
    }
) {

  const firstItem = currentItem ? currentItem : items[0]
  const [selected, setSelected] = useState(firstItem)

  return (
    <Listbox
      value={selected}
      onChange={(item) => {
        setSelected(item);
        setItem(item);
      }}
    >
      <div className="relative mt-2">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-[var(--background)] py-1.5 pl-3 pr-2 text-left text-[var(--foreground)] outline outline-1 -outline-offset-1 outline-[var(--border)] focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[var(--primary)] sm:text-sm/6">
          <span className="col-start-1 row-start-1 truncate pr-6">{selected}</span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-[var(--muted)] sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--background)] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {items.map((item, index) => (
            <ListboxOption
              key={index}
              value={item}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-[var(--foreground)] data-[focus]:bg-[var(--primary)] data-[focus]:text-[var(--background)] data-[focus]:outline-none"
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">{item}</span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--primary)] group-[&:not([data-selected])]:hidden group-data-[focus]:text-[var(--background)]">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
