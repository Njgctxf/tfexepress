import { Upload, X } from "lucide-react";
import { useRef } from "react";

export default function MultiImageUpload({ images = [], onChange }) {
  const inputRef = useRef(null);

  function addFiles(files) {
    const newFiles = Array.from(files);
    onChange([...images, ...newFiles]);
  }

  function removeImage(index) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* ZONE UPLOAD */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-blue-500 transition bg-gray-50 text-center"
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Upload size={28} />
          <p className="text-sm">
            Glissez vos images ou cliquez pour ajouter
          </p>
          <p className="text-xs text-gray-400">
            Plusieurs images autorisées
          </p>
        </div>
      </div>

      {/* PREVIEW GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative group border rounded-xl overflow-hidden"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="w-full h-32 object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
