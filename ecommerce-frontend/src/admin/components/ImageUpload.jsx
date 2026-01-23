import { Upload, X, Plus } from "lucide-react";
import { useRef } from "react";

export default function ImageUpload({ value, onChange, multiple = false }) {
  const inputRef = useRef(null);

  // Normalize value to array
  const files = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value] : []);

  function handleFiles(newFileObjects) {
    if (!newFileObjects || newFileObjects.length === 0) return;

    const fileArray = Array.from(newFileObjects);

    if (multiple) {
      onChange([...files, ...fileArray]);
    } else {
      onChange(fileArray[0]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removeImage(index, e) {
    e.stopPropagation();
    if (multiple) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  }

  const getPreviewUrl = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file;
    return URL.createObjectURL(file);
  };

  // MULTIPLE MODE
  if (multiple) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Loop Existing */}
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={getPreviewUrl(file)}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => removeImage(index, e)}
                  className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Add Button */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 cursor-pointer transition-all group"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="bg-gray-100 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-gray-500 group-hover:text-black" />
            </div>
            <span className="text-xs font-semibold text-gray-400 group-hover:text-black">Ajouter</span>
          </div>
        </div>

        {files.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            Aucune image sélectionnée
          </p>
        )}
      </div>
    );
  }

  // SINGLE MODE (Legacy)
  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-blue-500 transition bg-gray-50 text-center relative overflow-hidden group"
      >
        {value ? (
          <div className="relative inline-block w-full">
            <img
              src={getPreviewUrl(value)}
              alt="Preview"
              className="h-64 w-auto mx-auto object-contain rounded-lg"
            />
            <button
              onClick={(e) => removeImage(0, e)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500 py-8">
            <div className="bg-white p-3 rounded-full shadow-sm mb-2">
              <Upload size={24} className="text-black" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Cliquez ou glissez une image
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG – max 5 Mo
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
