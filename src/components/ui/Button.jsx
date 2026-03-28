import React from "react";

const variants = {
  primary: "bg-[#2EBD85] hover:bg-[#259A6C] text-white",
  secondary: "bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]",
  danger: "bg-[#F6465D] hover:bg-[#D93B4F] text-white",
  ghost: "bg-transparent hover:bg-[#1E1E1E] text-[#848E9C]",
  outline: "bg-transparent hover:bg-[#1E1E1E] text-white border border-[#2A2A2A]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
  xl: "px-8 py-3.5 text-lg rounded-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        inline-flex items-center justify-center
        ${className}
      `.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
