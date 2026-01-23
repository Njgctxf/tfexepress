import { useEffect } from "react";

const useSEO = ({
  title,
  description,
  image,
}) => {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    if (image) {
      let og = document.querySelector("meta[property='og:image']");
      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:image");
        document.head.appendChild(og);
      }
      og.content = image;
    }
  }, [title, description, image]);
};

export default useSEO;
