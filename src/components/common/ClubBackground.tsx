import Image from 'next/image';

export default function ClubBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
            <Image src="/images/hero-jeep.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#071741]/70 to-black/90" />
        </div>
    );
}
