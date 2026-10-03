import type { SVGProps } from "react";
import type { IconName } from "@/lib/content";

type Props = SVGProps<SVGSVGElement> & { size?: number };

function BaseIcon({ children, size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function Icon({ name, size = 24, ...props }: Props & { name: IconName }) {
  switch (name) {
    case "strategy":
      return <BaseIcon size={size} {...props}><path d="M12 3v4"/><path d="M5 8h14"/><path d="M6 21h12"/><path d="M8 8l-3 6h6L8 8Z"/><path d="M16 8l-3 6h6l-3-6Z"/><path d="M12 17v4"/></BaseIcon>;
    case "research":
      return <BaseIcon size={size} {...props}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/><path d="M8.5 11h5"/><path d="M11 8.5v5"/></BaseIcon>;
    case "mobile":
      return <BaseIcon size={size} {...props}><rect x="7" y="2.8" width="10" height="18.4" rx="2"/><path d="M10 17.7h4"/><path d="M11 5.8h2"/></BaseIcon>;
    case "code":
      return <BaseIcon size={size} {...props}><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 4-4 16"/></BaseIcon>;
    case "support":
      return <BaseIcon size={size} {...props}><path d="M4 12a8 8 0 0 1 16 0"/><path d="M6 16H4.8A1.8 1.8 0 0 1 3 14.2v-2.4A1.8 1.8 0 0 1 4.8 10H6v6Z"/><path d="M18 16h1.2a1.8 1.8 0 0 0 1.8-1.8v-2.4A1.8 1.8 0 0 0 19.2 10H18v6Z"/><path d="M18 16c0 2.2-2 4-4.5 4H12"/></BaseIcon>;
    case "web":
      return <BaseIcon size={size} {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/><path d="M7 6h.01"/><path d="M10 6h.01"/><path d="M13 6h.01"/><path d="m9 12 2 2-2 2"/><path d="M13.5 16h2.5"/></BaseIcon>;
    case "ai":
      return <BaseIcon size={size} {...props}><path d="M12 3l1.2 3.7L17 8l-3.8 1.3L12 13l-1.2-3.7L7 8l3.8-1.3L12 3Z"/><path d="M18 13l.7 2.1L21 16l-2.3.9L18 19l-.7-2.1L15 16l2.3-.9L18 13Z"/><path d="M6 13l.7 2.1L9 16l-2.3.9L6 19l-.7-2.1L3 16l2.3-.9L6 13Z"/></BaseIcon>;
    case "globe2":
      return <BaseIcon size={size} {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/><path d="M5.6 6.5h12.8M5.6 17.5h12.8"/></BaseIcon>;
    case "megaphone":
      return <BaseIcon size={size} {...props}><path d="m3 11 17-6v14L3 13v-2Z"/><path d="M11 15.8 13 21H8l-1.8-6.1"/><path d="M20 9h1a2 2 0 0 1 0 4h-1"/></BaseIcon>;
    case "rocket":
      return <BaseIcon size={size} {...props}><path d="M5 15c-1.5 1.2-2 3-2 5 2 0 3.8-.5 5-2"/><path d="M9 15 5 11c2-4 6-7 14-8-1 8-4 12-8 14l-2-2Z"/><circle cx="15" cy="9" r="1.5"/><path d="m9 15-2 2M11 17l-2 2"/></BaseIcon>;
  }
}

export function ArrowUpRight({ size = 18, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></BaseIcon>;
}

export function ArrowRight({ size = 18, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="M4 12h16"/><path d="m13 5 7 7-7 7"/></BaseIcon>;
}

export function ArrowLeft({ size = 18, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="M20 12H4"/><path d="m11 19-7-7 7-7"/></BaseIcon>;
}

export function Check({ size = 18, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="m5 12 4 4L19 6"/></BaseIcon>;
}

export function Close({ size = 20, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="m6 6 12 12"/><path d="M18 6 6 18"/></BaseIcon>;
}

export function Menu({ size = 22, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></BaseIcon>;
}

export function Send({ size = 18, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="m3 11 18-8-8 18-2.8-7.2L3 11Z"/><path d="M10.2 13.8 14 10"/></BaseIcon>;
}

export function WhatsApp({ size = 22, ...props }: Props) {
  return <BaseIcon size={size} {...props}><path d="M20.5 11.7a8.3 8.3 0 0 1-12.4 7.2L3 20l1.2-5.1a8.3 8.3 0 1 1 16.3-3.2Z"/><path d="M8.6 8.2c.2-.4.4-.5.7-.5h.5c.2 0 .3.1.4.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3-.1.5.4.8 1.3 1.7 2.2 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .3-.1.9-.6 1.3-.5.4-1.1.6-1.8.5-1-.1-2.1-.6-3.4-1.7-1.4-1.2-2.2-2.5-2.4-3.5-.2-.8 0-1.5.4-2.3Z"/></BaseIcon>;
}
