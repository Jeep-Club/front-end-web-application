import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  className?: string;
  sizes?: string;
}

export const Logo = ({ className, sizes = "(min-width: 768px) 48px, 40px" }: LogoProps) => {
  return (
    <Link href="/" className={twMerge(
      `block w-10 h-10 md:w-12 md:h-12 overflow-hidden relative`,
      className
    )}>
      <Image
        src="/favicon.ico"
        alt="logo"
        fill
        sizes={sizes}
        className="object-cover"
        priority
      />
    </Link>
  );
};
