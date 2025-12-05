import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  label: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, preview, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={triggerUpload}
      className={`relative group cursor-pointer transition-all duration-300
        ${preview ? 'h-48' : 'h-32'} 
        w-full rounded-xl border-2 border-dashed 
        ${preview ? 'border-purple-300 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}
        overflow-hidden
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {preview ? (
        <div className="w-full h-full relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
              Change Image
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
          <Upload className="w-6 h-6 group-hover:text-purple-500 transition-colors" />
          <span className="text-xs font-medium text-center px-4 group-hover:text-purple-600 transition-colors">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};