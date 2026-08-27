import { cn } from "@/lib/utils";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.58 14.24 3.58c-2.4 0-4.05 1.47-4.05 4.16V9.9H7.5V13h2.69v8h3.31Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M18.9 3H21.7l-6.1 7 7.2 9.6h-5.6l-4.4-5.8-5 5.8H4.9l6.5-7.5L4.5 3h5.7l4 5.3L18.9 3Zm-1 15h1.5L7.2 4.9H5.6L17.9 18Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M6.94 8.5H4V20h2.94V8.5ZM5.47 3.5A1.71 1.71 0 1 0 5.5 6.9a1.71 1.71 0 0 0-.03-3.4ZM20 13.35c0-3.06-1.63-4.48-3.81-4.48a3.3 3.3 0 0 0-3 1.64V8.5H10.3c.04.86 0 11.5 0 11.5h2.94v-6.43a2 2 0 0 1 .1-.72 1.63 1.63 0 0 1 1.53-1.09c1.08 0 1.51.82 1.51 2.03V20H20v-6.65Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.3A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 0 1 6.1 11 7.15 7.15 0 0 1-6.1 3.4 7.2 7.2 0 0 1-3.6-1l-.3-.15-2.5.7.7-2.4-.17-.32A7.2 7.2 0 0 1 12 4.8Zm-2.4 3.6c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2s.87 2.32 1 2.48c.12.16 1.7 2.7 4.2 3.68 2.06.82 2.48.66 2.93.62.45-.05 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.13-1.44-.71-1.66-.8-.22-.08-.39-.12-.55.13-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.13-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.5.12-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.55-1.36-.77-1.86-.19-.47-.4-.42-.55-.42Z" />
    </svg>
  );
}

const iconButtonClass =
  "flex size-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105";

export function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={facebookHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={cn(iconButtonClass, "bg-[#1877F2]")}
      >
        <FacebookIcon />
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={cn(iconButtonClass, "bg-slate-900")}
      >
        <XIcon />
      </a>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={cn(iconButtonClass, "bg-[#0A66C2]")}
      >
        <LinkedInIcon />
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={cn(iconButtonClass, "bg-[#25D366]")}
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
