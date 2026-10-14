function Button({ children, inStock, className = "", ...props }) {
  const stockClass = inStock ? "primary-btn" : "btn-disabled";

  return (
    <button
      type="button" // Default type, can be overridden by ...props
      disabled={!inStock} // Disables the button if out of stock
      className={`btn ${stockClass} ${className}`} // Combines base, state, and custom classes
      {...props} // Spreads onClick, type, aria-attributes, etc.
    >
      {children}
    </button>
  );
}

export default Button;
