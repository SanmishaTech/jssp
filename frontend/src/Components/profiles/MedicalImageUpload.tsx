import { useState, useEffect } from "react";
import { X, Upload, Image } from "lucide-react";
import { toast } from "sonner";

interface MedicalImageUploadProps {
  existingMedicalImage: any;
  onAddMedicalImage: (file: File) => void;
  onRemoveMedicalImage: () => void;
}

export default function MedicalImageUpload({ 
  existingMedicalImage = null, 
  onAddMedicalImage, 
  onRemoveMedicalImage
}: MedicalImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up the preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Only take the first file if multiple are selected
      const file = files[0];
      
      // Validate file type - only accept image formats
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }
      
      // Validate file size - max 2MB
      if (file.size > 2 * 1024 * 1024) { // 2MB in bytes
        toast.error("Image must be less than 2MB");
        return;
      }

      // If there's already a selected image, revoke its URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Set the new selected image
      setSelectedImage(file);
      
      // Create preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      // Notify parent component
      onAddMedicalImage(file);
      
      // Reset the input field
      e.target.value = '';
    }
  };

  const removeMedicalImage = () => {
    // Clear selected image
    setSelectedImage(null);
    
    // Revoke preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Notify parent
    onRemoveMedicalImage();
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor="medical-image-upload" 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload medical image</span>
            </p>
            <p className="text-xs text-gray-500">JPEG, PNG, JPG (Max 2MB)</p>
          </div>
          <input
            id="medical-image-upload"
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            disabled={!!selectedImage || !!existingMedicalImage}
          />
        </label>
      </div>

      {/* Display existing medical image */}
      {existingMedicalImage && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Medical Image</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-blue-500" />
              <a 
                href={`/api/staff-file/${existingMedicalImage.image_path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {existingMedicalImage.image_path || `Medical Image`}
              </a>
            </div>
            <button
              type="button"
              onClick={onRemoveMedicalImage}
              className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Display newly added image */}
      {selectedImage && !existingMedicalImage && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">New Medical Image</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {selectedImage.name}
                </span>
                {previewUrl && (
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Preview
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={removeMedicalImage}
              className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
