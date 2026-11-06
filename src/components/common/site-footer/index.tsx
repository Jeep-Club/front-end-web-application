import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { GiJeep } from "react-icons/gi";
import LegalLinks from "@/components/common/legal-links";
import { getLegalContact } from "@/config/legal";
import { footerInfo } from "@/config/footer";

export default function SiteFooter() {
  const contact = getLegalContact();
  const socialLinks = [
    { label: "Instagram", href: footerInfo.instagram.trim(), Icon: FaInstagram },
    { label: "Facebook", href: footerInfo.facebook.trim(), Icon: FaFacebookF },
    { label: "YouTube", href: footerInfo.youtube.trim(), Icon: FaYoutube },
  ];
  const institutionalDetails = [
    `CNPJ: ${contact.controllerDocument || footerInfo.cnpj.trim() || "XXXXX"}`,
    `E-mail: ${contact.supportEmail || footerInfo.email.trim() || "XXXXX"}`,
    `Endereço: ${contact.controllerAddress || footerInfo.address.trim() || "XXXXX"}`,
  ].join(" · ");

  return (
    <footer className="border-t border-white/10 bg-[#272a32] px-6 py-8 text-white print:hidden sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-7 pb-7 md:flex-row md:justify-between md:gap-10">
          <div className="flex items-center gap-3">
            <GiJeep size={30} className="shrink-0 text-yellow-400" aria-hidden="true" />
            <div>
              <p className="text-base font-bold tracking-tight">Jeep Clube Tamoios</p>
              <p className="mt-1 text-xs text-gray-300">Aventura e amizade desde 1999.</p>
            </div>
          </div>
          <LegalLinks className="max-w-xl text-gray-200 md:justify-end" />
          <div className="shrink-0 text-center md:text-right">
              <h2 id="redes-sociais-titulo" className="text-sm font-semibold">Redes sociais</h2>
              <nav aria-labelledby="redes-sociais-titulo" className="mt-3 flex justify-center gap-2 md:justify-end">
                {socialLinks.map(({ label, href, Icon }) => {
                  const className = "flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-gray-200 transition-colors hover:border-yellow-400 hover:bg-yellow-400 hover:text-j-blue-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400";
                  return /^https:\/\//i.test(href) ? (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} do Jeep Clube Tamoios (abre em nova aba)`} className={className}>
                      <Icon size={19} aria-hidden="true" />
                    </a>
                  ) : (
                    <button key={label} type="button" aria-label={`${label} (link ainda não disponível)`} className={className}>
                      <Icon size={19} aria-hidden="true" />
                    </button>
                  );
                })}
              </nav>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5 text-center">
          <p className="text-sm leading-7 text-gray-100 [overflow-wrap:anywhere]">{institutionalDetails}</p>
          <p className="mt-2 text-xs leading-6 text-gray-400">© 2026 Jeep Clube Tamoios. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
