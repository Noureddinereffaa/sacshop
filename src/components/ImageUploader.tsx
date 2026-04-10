"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  placeholder?: string;
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "صورة المنتج",
  bucket = "products",
  placeholder = "اضغط للرفع أو اسحب الصورة هنا"
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!supabase) {
      setError("لا يوجد اتصال بقاعدة البيانات");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("الرجاء رفع صورة صالحة");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
       setError("حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)");
       return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
           cacheControl: '3600',
           upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err?.message || "فشل الرفع");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-black text-gray-700">{label}</label>
      
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center p-2 aspect-square">
          <Image 
            src={value} 
            alt="Uploaded" 
            layout="fill" 
            objectFit="contain"
            className="rounded-xl"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
             <button
               type="button"
               onClick={() => onChange("")}
               className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 transition-colors shadow-xl"
               title="حذف الصورة"
             >
                <X size={24} />
             </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-colors ${
            isUploading ? 'bg-primary/5 border-primary/20 pointer-events-none' : 'bg-gray-50 border-gray-200 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
           {isUploading ? (
             <>
               <Loader2 className="animate-spin text-primary" size={32} />
               <span className="text-sm font-bold text-primary">جاري الرفع...</span>
             </>
           ) : (
             <>
               <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                  <UploadCloud size={24} />
               </div>
               <div>
                  <p className="font-bold text-gray-700 text-sm">{placeholder}</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF حتى 5MB</p>
               </div>
             </>
           )}
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*" 
             className="hidden" 
           />
        </div>
      )}
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
      
      {/* Fallback for pasting URL directly */}
      {!isUploading && !value && (
         <div className="pt-2">
           <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="أو ضع رابط الصورة هنا..." 
                className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none dir-ltr text-left font-sans"
                onChange={(e) => {
                  if(e.target.value.startsWith('http')) onChange(e.target.value);
                }}
              />
           </div>
         </div>
      )}
    </div>
  );
}
