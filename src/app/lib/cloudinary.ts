export const uploadToCloudinary = async (file: File): Promise<string> => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "exzort"); // You need to create an unsigned preset in Cloudinary dashboard

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url as string;
};
