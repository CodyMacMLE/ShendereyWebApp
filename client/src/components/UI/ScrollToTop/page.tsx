"use client";
import { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/solid"; // Assuming you imported PlusIcon correctly.

export default function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);

  // Handle scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className={`fixed bottom-10 right-10 rounded-full bg-gray-300 p-3 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-opacity ${
        showButton ? "opacity-60" : "opacity-0"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to Top"
    >
      <ChevronUpIcon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
