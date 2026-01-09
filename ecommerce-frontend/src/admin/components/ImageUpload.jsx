import { Upload, X } from "lucide-react";
import { useRef } from "react";

export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    onChange(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-3">
      {/* ZONE UPLOAD */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-blue-500 transition bg-gray-50 text-center"
      >
        {value ? (
          <div className="relative inline-block">
            <img
              src={URL.createObjectURL(value)}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-xl mx-auto"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload size={28} />
            <p className="text-sm">
              Glissez une image ou cliquez pour choisir
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG – max 5 Mo
            </p>
          </div>
        )}
      </div>

      {/* INPUT HIDDEN */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
