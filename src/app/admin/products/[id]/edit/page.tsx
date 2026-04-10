"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductForm from "../../components/ProductForm";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!id || typeof id !== "string") return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error || !data) {
         console.error(error);
         alert("تعذر العثور على المنتج");
         router.push("/admin/products");
         return;
      }
      
      setProduct(data as Product);
      setIsLoading(false);
    }
    
    init();
  }, [id, router]);

  if (isLoading) {
    return (
       <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
       </div>
    );
  }

  return (
     <div className="max-w-5xl mx-auto py-8">
        <ProductForm initialData={product || undefined} />
     </div>
  );
}
