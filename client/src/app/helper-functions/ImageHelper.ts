export const allowedImageTypes = ['image/png', 'image/jpeg', 'image/svg', 'image/webp'];
export const maxAllowedImageSizeInMb = 2;

export const toBase64 = (file: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});