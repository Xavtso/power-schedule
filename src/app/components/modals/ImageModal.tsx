"use client";

import { Image as ImageIcon } from "lucide-react";

type ImageModalProps = {
  imageUrl: string;
  onClose: () => void;
};

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <ImageIcon className="h-4 w-4" />
            Офіційне зображення графіка
          </p>
          <button type="button" className="text-zinc-400 hover:text-zinc-700" onClick={onClose}>
            Закрити
          </button>
        </div>
        <div className="max-h-[85vh] overflow-auto bg-zinc-50">
          <img src={imageUrl} alt="Outage schedule" className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
