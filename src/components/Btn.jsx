import React from "react";
import CircleIcon from "./CircleIcon";

const SecondaryBtn = ({ text, classText = "", ...props }) => {
  return (
    <button className={`btn-s ${classText}`.trim()} {...props}>
      {text}
      <CircleIcon />
    </button>
  );
};

const PrimaryBtn = ({ text, className = "", children, ...props }) => {
  return (
    <button className={`btn-p ${className}`.trim()} {...props}>
      {text || children}
    </button>
  );
};

export { PrimaryBtn, SecondaryBtn };
