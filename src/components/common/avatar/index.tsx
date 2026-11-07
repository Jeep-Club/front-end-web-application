import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src: string;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function Avatar({ src, alt = 'Foto de perfil', className, loading = "lazy" }: AvatarProps) {
  return (
    <div className={twMerge(
      `w-9 h-9 rounded-full overflow-hidden relative bg-j-blue-700`,
      className
    )}>
      {/* O navegador precisa anexar o cookie ao proxy autenticado; o otimizador do Next
          busca a imagem sem a sessão do usuário. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading={loading}
        decoding="async"
      />
    </div>
  );
}

export default Avatar;
