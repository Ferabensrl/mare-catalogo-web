'use client'
import Image from 'next/image'

export default function ProductImage({ src, alt, height, onError, className }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={height}
      className={`w-full object-cover ${className ?? ''}`}
      onError={onError}
      unoptimized
    />
  )
}
