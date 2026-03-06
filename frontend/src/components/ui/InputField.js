import React from "react";

function InputField({ label, error, helperText, className = "", ...props }) {
  return (
    <div>
      {label ? <label className="label">{label}</label> : null}
      <input className={`input ${className}`} {...props} />
      {error ? <p className="error-text">{error}</p> : null}
      {!error && helperText ? <p className="helper">{helperText}</p> : null}
    </div>
  );
}

export default InputField;
