import React from "react";

const Input = ({
  label,
  error,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-[#848E9C] mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-[#1E1E1E] text-white border border-[#2A2A2A] rounded-lg
          px-4 py-3 text-sm placeholder-[#5E6673]
          focus:outline-none focus:ring-2 focus:ring-[#2EBD85] focus:border-transparent
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-[#F6465D] focus:ring-[#F6465D]" : ""}
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[#F6465D]">{error}</p>
      )}
    </div>
  );
};

export default Input;
