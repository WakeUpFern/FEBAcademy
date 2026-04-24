"use client";

import { useState, useEffect } from "react";

const ANIMATED_WORDS = [
  { text: "cademy", color: "#F65F4C" },
  { text: "code", color: "#00BFD8" },
];

export function AnimatedLogoText() {
  const [text, setText] = useState(ANIMATED_WORDS[0].text);
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = ANIMATED_WORDS[wordIndex].text;
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % ANIMATED_WORDS.length);
      } else {
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1));
        }, 100);
      }
    } else {
      if (text === currentWord) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 5000);
      } else {
        timeout = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1));
        }, 150);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <span
      style={{ color: ANIMATED_WORDS[wordIndex].color }}
      className="transition-colors duration-300 inline-flex items-center min-w-[125px]"
    >
      {text}
      <span className="w-[2px] h-[1em] bg-current ml-0.5 animate-[pulse_1s_ease-in-out_infinite] inline-block" />
    </span>
  );
}