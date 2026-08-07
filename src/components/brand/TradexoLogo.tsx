import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO } from "@/lib/home-images";
import { cn } from "@/lib/utils";

type TradexoLogoProps = {
  className?: string;
  /** light = dark text logo for white backgrounds; dark = white text for dark backgrounds */
  variant?: "light" | "dark";
  size?: "nav" | "md" | "lg";
  href?: string;
};

const sizes = {
  nav: { width: 280, height: 84, className: "h-11 w-auto sm:h-12 md:h-[3.25rem]" },
  md: { width: 300, height: 90, className: "h-14 w-auto sm:h-[3.75rem]" },
  lg: { width: 360, height: 108, className: "h-16 w-auto sm:h-[4.25rem]" },
};

export function TradexoLogo({
  className,
  variant = "light",
  size = "nav",
  href,
}: TradexoLogoProps) {
  const s = sizes[size];
  const src = variant === "dark" ? BRAND_LOGO.dark : BRAND_LOGO.light;

  const img = (
    <Image
      src={src}
      alt="Tradexo — Markets near you, wholesalers across India"
      width={s.width}
      height={s.height}
      className={cn(s.className, "object-contain object-left", className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {img}
      </Link>
    );
  }

  return img;
}
