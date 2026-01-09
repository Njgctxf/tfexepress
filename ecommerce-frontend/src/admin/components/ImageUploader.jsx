import { Upload, X } from "lucide-react";
import { useRef } from "react";

export default function ImageUploader({ images, setImages }) {
  const inputRef = useRef(null);

  function handleFiles(files) {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function removeImage(index) {
    const copy = [...images];
    copy.splice(index, 1);
    setImages(copy);
  }

  return (
    <div className="space-y-4">
      {/* DROP ZONE */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <Upload className="mx-auto mb-2 text-gray-500" />
        <p className="text-sm text-gray-600">
          Glissez-déposez vos images ou cliquez ici
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* PREVIEW */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border"
            >
              <img
                src={img.preview}
                alt=""
                className="w-full h-32 object-cover"
              />

              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
