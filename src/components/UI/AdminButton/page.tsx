"use client";
import { UserIcon } from "@heroicons/react/24/solid";
import { redirect } from "next/navigation";

export default function AdminButton() {

  return (
    <button
      type="button"
      className={"fixed bottom-5 left-5 z-80 rounded-full bg-zinc-800 p-2 text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-opacity"}
      onClick={() => redirect('/admin')}
      aria-label="Admin"
    >
      <UserIcon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}