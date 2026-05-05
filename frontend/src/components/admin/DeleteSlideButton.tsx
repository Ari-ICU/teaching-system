"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
}

export default function DeleteSlideButton({ id }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;

    setIsDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Failed to delete slide");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete slide");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border-none bg-transparent cursor-pointer ${isDeleting ? 'opacity-50' : 'opacity-100'}`}
    >
      <Trash2 size={14} />
    </button>
  );
}
