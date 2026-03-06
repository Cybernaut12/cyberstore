import React from "react";

function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
  };

  return (
    <button className={`${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
