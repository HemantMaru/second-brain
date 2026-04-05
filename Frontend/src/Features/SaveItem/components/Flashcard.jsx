import React, { useState } from "react";
import "./Flashcard.css";

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flashcard-container ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flashcard-inner">
        {/* Front: Question */}
        <div className="flashcard-front">
          <div className="absolute top-6 left-0 right-0 text-center">
            <span className="text-indigo-500 text-[9px] font-black uppercase tracking-[0.5em]">
              Question
            </span>
          </div>
          <p className="text-white text-base md:text-lg font-bold leading-relaxed text-center px-4">
            {question}
          </p>
          <div className="absolute bottom-6 text-gray-600 text-[8px] font-black uppercase tracking-widest animate-pulse">
            Click to flip
          </div>
        </div>

        {/* Back: Answer */}
        <div className="flashcard-back">
          <div className="absolute top-6 left-0 right-0 text-center">
            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.5em]">
              Answer
            </span>
          </div>
          <p className="text-white text-base md:text-lg font-medium leading-relaxed text-center px-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
