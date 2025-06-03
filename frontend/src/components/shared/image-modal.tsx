"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image as ImageIcon } from "@phosphor-icons/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageModal({ src, alt, className }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Failed to load image: ${src}`);
    setImageError(true);
  };

  return (
    <>
      <div
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {!imageError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="size-12 text-muted-foreground" weight="bold" />
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-5xl border-none bg-transparent p-1 shadow-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-2 right-2 z-50 rounded-full bg-background/80 p-2 backdrop-blur-sm"
          >
            <X className="size-5" />
          </button>
          <div className="relative aspect-auto max-h-[calc(100vh-6rem)] overflow-hidden rounded-lg">
            {!imageError ? (
              <Image
                src={src}
                alt={alt}
                className="object-contain"
                fill
                quality={95}
                sizes="(max-width: 768px) 100vw, 75vw"
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-muted">
                <ImageIcon className="size-16 text-muted-foreground" weight="bold" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
