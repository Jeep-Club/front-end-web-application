import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link href="/" className={twMerge(
      `block w-10 h-10 md:w-12 md:h-12 overflow-hidden relative`,
      className
    )}>
      <Image
        src="/favicon.ico"
        alt="logo"
        fill
        className="object-cover"
        priority
      />
    </Link>
  );
};