export const resizeImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const scale = MAX_WIDTH / img.width;

            if (scale < 1) {
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
    };
    reader.onerror = (err) => resolve(null);
});
