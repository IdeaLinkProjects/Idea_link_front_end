import Image from "next/image";
import Link from "next/link";

type IdealLinkLogoProps = {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function IdealLinkLogo({
  href = "/",
  width = 132,
  height = 38,
  className = "",
  imageClassName = "",
  priority = false,
  onClick,
}: IdealLinkLogoProps) {
  return (
    <Link href={href} className={className} aria-label="IdealLink home" onClick={onClick}>
      <Image
        src="/idealink-logo.png"
        alt="IdealLink"
        width={width}
        height={height}
        priority={priority}
        className={imageClassName}
      />
    </Link>
  );
}
