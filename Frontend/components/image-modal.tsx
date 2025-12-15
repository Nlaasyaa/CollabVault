"use client"

import { X } from "lucide-react"

interface ImageModalProps {
    imageUrl: string | null
    onClose: () => void
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    if (!imageUrl) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[60]"
            >
                <X size={32} />
            </button>
            <div
                className="relative max-w-full max-h-full flex items-center justify-center p-2"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Full size attachment"
                    className="max-w-screen max-h-[90vh] object-contain rounded-md shadow-2xl"
                />
            </div>
        </div>
    )
}
