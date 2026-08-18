import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

// A single-image upload field: shows a preview if a URL is already set,
// uploads to Cloudinary via the backend on file select, and reports the
// resulting URL back to the parent form.
export default function ImageUpload({ label, value, onChange }) {
  const { request } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const result = await request('/upload', { method: 'POST', body: formData });
      onChange(result.url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className="image-upload-field">
      {label}
      <div className="image-upload-row">
        {value ? (
          <img src={value} alt="Preview" className="image-upload-preview" />
        ) : (
          <div className="image-upload-preview image-upload-preview--empty">No image</div>
        )}
        <div>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
          {uploading && <small>Uploading…</small>}
        </div>
      </div>
    </label>
  );
}
