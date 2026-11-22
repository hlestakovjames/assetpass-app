import Image from "next/image";
import Link from "next/link";

export function AssetPassBrand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="AssetPass home"
      className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <Image
        src="/brand/Assetpass%20Logo.png"
        alt=""
        width={42}
        height={42}
        className="h-10 w-10 shrink-0 object-contain"
      />
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Asset<span className="text-teal-600">Pass</span>
      </span>
    </Link>
  );
}
