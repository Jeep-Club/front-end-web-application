import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src: string;
  alt?: string;
  className?: string;
}

export function Avatar({ src, alt = 'Foto de perfil', className }: AvatarProps) {
  return (
    <div className={twMerge(
      `w-9 h-9 rounded-full overflow-hidden relative bg-j-blue-700`,
      className
    )}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="36px"
        className="object-cover"
      />
    </div>
  );
}

export default Avatar;
