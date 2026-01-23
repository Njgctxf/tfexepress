import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const AuthInput = ({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  showToggle = false,
}) => {
  const [show, setShow] = useState(false);

  const inputType =
    type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="relative">
      <Icon
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-11 pr-11 py-3 rounded-xl border
          text-sm outline-none
          focus:ring-2 focus:ring-yellow-400
          focus:border-yellow-400
          transition
        "
      />

      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default AuthInput;
