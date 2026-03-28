import React from "react";

const Card = ({
  children,
  className = "",
  padding = "p-4",
  ...props
}) => {
  return (
    <div
      className={`
        bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl
        ${padding}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
