export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_unsigned_preset'); // replace with yours

  const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

  return data.secure_url;
}
