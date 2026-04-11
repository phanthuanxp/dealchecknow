import Image from "next/image";
import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ComponentType<IconProps>;

function RasterIcon({
  src,
  className,
  rounded = false
}: {
  src: string;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={24}
      aria-hidden
      unoptimized
      className={`${className ?? ""} ${rounded ? "rounded-full" : ""} object-cover`}
    />
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.9 4.8a1.6 1.6 0 012.2 0l1.9 1.9a1.6 1.6 0 010 2.2l-1 1a11.2 11.2 0 004.1 4.1l1-1a1.6 1.6 0 012.2 0l1.9 1.9a1.6 1.6 0 010 2.2l-.8.8a3.7 3.7 0 01-3.9.9c-2.4-1-4.9-2.9-7.2-5.2-2.3-2.3-4.2-4.8-5.2-7.2a3.7 3.7 0 01.9-3.9l.9-.7z"
      />
    </svg>
  );
}

export function PhoneCallIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.9 4.8a1.6 1.6 0 012.2 0l1.9 1.9a1.6 1.6 0 010 2.2l-1 1a11.2 11.2 0 004.1 4.1l1-1a1.6 1.6 0 012.2 0l1.9 1.9a1.6 1.6 0 010 2.2l-.8.8a3.7 3.7 0 01-3.9.9c-2.4-1-4.9-2.9-7.2-5.2-2.3-2.3-4.2-4.8-5.2-7.2a3.7 3.7 0 01.9-3.9l.9-.7z"
      />
      <path strokeLinecap="round" d="M14.8 5.2a4.3 4.3 0 012.7 2.7M13.7 2.9a8 8 0 014.9 4.9" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H11l-4.5 4v-4H6.5A2.5 2.5 0 014 13.5v-7z"
      />
      <path strokeLinecap="round" d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

export function ZaloIcon(props: IconProps) {
  return <RasterIcon src="/icons/zalo-icon.png" className={props.className} />;
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19c1.4-3.1 4.1-4.7 7-4.7s5.6 1.6 7 4.7" />
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.8h8.6L19 9.2V19a1.8 1.8 0 01-1.8 1.8H6A1.8 1.8 0 014.2 19V6.6A1.8 1.8 0 016 4.8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.6 4.8v4.1H19M8 12h8M8 15h8" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.6 7.3l7.4 6 7.4-6" />
    </svg>
  );
}

export function MoneyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <rect x="3.2" y="6.2" width="17.6" height="11.6" rx="2" />
      <circle cx="12" cy="12" r="2.3" />
      <path strokeLinecap="round" d="M6.2 10.2h.01M17.8 13.8h.01" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 13.5l1.8-4.4a2 2 0 011.9-1.2h9.6a2 2 0 011.9 1.2l1.8 4.4"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h18v4a1.5 1.5 0 01-1.5 1.5h-1a1 1 0 01-1-1v-1h-11v1a1 1 0 01-1 1h-1A1.5 1.5 0 013 17.5v-4z" />
      <circle cx="7" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RouteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 6h2a3 3 0 013 3v6a3 3 0 003 3h2" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v4.8l3 1.7" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5l7 3.2v5.7c0 4.3-2.6 7.7-7 8.9-4.4-1.2-7-4.6-7-8.9V6.7l7-3.2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 12.2l2.1 2.1 4.5-4.5" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.6 12.2l2.3 2.3 4.7-4.7" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden {...props}>
      <path d="M12 3.7l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 3.7z" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="2.2" />
      <path strokeLinecap="round" d="M8 3.8v3.1M16 3.8v3.1M4 9.2h16" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c3.6-3.5 6.2-6.6 6.2-10.3a6.2 6.2 0 10-12.4 0C5.8 14.4 8.4 17.5 12 21z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </svg>
  );
}

const iconByKey: Record<string, IconComponent> = {
  car: CarIcon,
  route: RouteIcon,
  clock: ClockIcon,
  shield: ShieldCheckIcon,
  check: CheckCircleIcon,
  star: StarIcon,
  phone: PhoneIcon,
  chat: ChatIcon,
  zalo: ZaloIcon,
  call: PhoneCallIcon,
  plus: PlusIcon,
  user: UserIcon,
  note: NoteIcon,
  mail: MailIcon,
  money: MoneyIcon
};

export function resolveUiIcon(key: string | undefined, fallback: IconComponent): IconComponent {
  if (!key) {
    return fallback;
  }

  return iconByKey[key.toLowerCase()] ?? fallback;
}
