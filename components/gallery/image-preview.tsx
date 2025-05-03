"use client"

import { useState, useEffect } from "react"

interface ImagePreviewProps {
  isOpen: boolean
  onClose: () => void
  currentImage: string
  serviceName: string
}

export function ImagePreview({
  isOpen,
  onClose,
  currentImage,
  serviceName
}: ImagePreviewProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">

      {/* Close button — anchored to screen */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-pink-500/20 backdrop-blur-sm rounded-full p-2 hover:bg-pink-500/30 transition-colors z-50"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative max-w-4xl w-full mx-auto">
        {/* Image container */}
        <div className="relative w-full max-h-[90vh] mx-auto p-4 flex justify-center items-center">
          <img
            src={`/images/${currentImage}`}
            alt={`${serviceName} work`}
            className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
          />
        </div>

        {/* Service name label */}
        <div className="absolute bottom-12 left-12 text-white">
          <h3 className="font-semibold text-xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            {serviceName}
          </h3>
          <div className="w-24 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 mt-2"></div>
        </div>

        {/* Click outside to close */}
        <div
          className="absolute inset-0 z-0 cursor-pointer"
          onClick={onClose}
        />
      </div>
    </div>
  )
}
