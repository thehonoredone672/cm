import "./Input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-group__label">
          {label}
        </label>
      )}

      <input
        className="input-group__field"
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
    </div>
  );
}