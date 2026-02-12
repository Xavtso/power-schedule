"use client";

import { Image as ImageIcon } from "lucide-react";

type ImageModalProps = {
  imageUrl: string;
  onClose: () => void;
};

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose}>
      <div
        className="relative h-full w-full bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-black/60 px-5 py-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-200">
            <ImageIcon className="h-4 w-4" />
            Офіційне зображення графіка
          </p>
          <button
            type="button"
            className="text-zinc-200 hover:text-white"
            onClick={onClose}
          >
            Закрити
          </button>
        </div>
        <div className="flex h-full w-full items-center justify-center overflow-auto">
          <img
            src={imageUrl}
            alt="Outage schedule"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
