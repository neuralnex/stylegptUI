import React from "react";
import { Button } from "@heroui/react";
import CircleIcon from "./CircleIcon";

const SecondaryBtn = ({ text, classText = "", ...props }) => {
  return (
    <Button
      variant="light"
      radius="full"
      className={`btn-s ${classText}`.trim()}
      endContent={<CircleIcon />}
      {...props}
    >
      {text}
    </Button>
  );
};

const PrimaryBtn = ({ text, className = "", children, ...props }) => {
  return (
    <Button
      color="primary"
      variant="solid"
      radius="full"
      className={`btn-p ${className}`.trim()}
      {...props}
    >
      {text || children}
    </Button>
  );
};

export { PrimaryBtn, SecondaryBtn };
