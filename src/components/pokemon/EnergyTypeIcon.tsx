import { useId } from "react";

import type { PokemonType } from "../../constants/pokemonTypes";

interface EnergyTypeIconProps {
  type: PokemonType;
  size?: number;
  className?: string;
}

/** Original energy-disc icons inspired by TCG type colors (not official assets). */
const TYPE_COLORS: Record<PokemonType, string> = {
  Colorless: "#E8E4D9",
  Darkness: "#2C3147",
  Dragon: "#C9A23B",
  Fairy: "#E08BB8",
  Fighting: "#C45A2A",
  Fire: "#E4572E",
  Grass: "#5FAE3A",
  Lightning: "#F2D12B",
  Metal: "#A8B0C0",
  Psychic: "#C45B9F",
  Water: "#3B89D0",
};

export function EnergyTypeIcon({
  type,
  size = 18,
  className,
}: EnergyTypeIconProps) {
  const shineId = useId().replace(/:/g, "");
  const fill = TYPE_COLORS[type];
  const glyph =
    type === "Lightning" || type === "Colorless" || type === "Dragon"
      ? "#2A2A2A"
      : "#FFFFFF";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={shineId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="12" cy="12" r="11" fill={fill} />
      <circle cx="12" cy="12" r="11" fill={`url(#${shineId})`} />
      <circle
        cx="12"
        cy="12"
        r="10.2"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
      />
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="1"
      />
      {renderGlyph(type, glyph)}
    </svg>
  );
}

function renderGlyph(type: PokemonType, color: string) {
  switch (type) {
    case "Fire":
      return (
        <path
          fill={color}
          d="M12.1 4.2c.9 1.7.2 2.9-.4 4-.5.8-.9 1.5-.5 2.4.6-1 1.7-1.5 2.6-1.1.4 1.5-.2 2.8-1.2 3.9-.2.9.1 1.6.8 2.1-.9 1.7-2.8 2.7-4.7 2.1-2.1-.7-3.1-2.9-2.4-5 .6-1.8 2.1-3 3.2-4.5.5-.7.9-1.6 1.1-2.6.3-.8.9-1.2 1.5-1.3z"
        />
      );
    case "Water":
      return (
        <path
          fill={color}
          d="M12 4.3c2.6 3.3 4.8 5.7 4.8 8.1a4.8 4.8 0 1 1-9.6 0c0-2.4 2.2-4.8 4.8-8.1z"
        />
      );
    case "Grass":
      return (
        <g fill={color}>
          <path d="M12 5.2c2.9 1.1 4.7 3.2 5.1 5.9-1.5-.2-2.9-.9-3.9-2-.1 2.1-.7 3.8-1.8 5.3-.2.3-.5.3-.8 0-1.1-1.5-1.7-3.2-1.8-5.3-1 1.1-2.4 1.8-3.9 2 .4-2.7 2.2-4.8 5.1-5.9z" />
          <path d="M11.4 14.2h1.2v4.1h-1.2z" />
        </g>
      );
    case "Lightning":
      return (
        <path
          fill={color}
          d="M13.4 3.8 8 12.2h3.1L9.4 20.2 16.2 10.8h-3.2L14.6 3.8z"
        />
      );
    case "Psychic":
      return (
        <g fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="5.4" />
          <circle cx="12" cy="12" r="2.2" fill={color} stroke="none" />
          <path d="M12 4.4v2.1M12 17.5v2.1M4.4 12h2.1M17.5 12h2.1" />
        </g>
      );
    case "Fighting":
      return (
        <path
          fill={color}
          d="M8.1 7.4h2.1V9H8.1zm2.9 0h2.1V9h-2.1zm2.9 0h2.1V9h-2.1zM8.1 10.1h2.1v5.4c0 1.5.7 2.5 1.8 2.5s1.8-1 1.8-2.5v-5.4h2.1v5.4c0 2.7-1.6 4.4-3.9 4.4s-3.9-1.7-3.9-4.4z"
        />
      );
    case "Darkness":
      return (
        <path
          fill={color}
          d="M13.9 5.1A6.8 6.8 0 1 0 18.2 14 5.5 5.5 0 0 1 13.9 5.1z"
        />
      );
    case "Metal":
      return (
        <g fill={color}>
          <path d="M12 4.8 17.2 8v8L12 19.2 6.8 16V8L12 4.8zm0 1.9L8.4 9v6l3.6 2.2L15.6 15V9L12 6.7z" />
          <circle cx="12" cy="12" r="2.1" />
        </g>
      );
    case "Fairy":
      return (
        <path
          fill={color}
          d="M12 4.5 13.2 9.2H18l-3.7 2.8 1.4 4.8L12 14.2 8.3 16.8l1.4-4.8L6 9.2h4.8L12 4.5z"
        />
      );
    case "Dragon":
      return (
        <g fill={color}>
          <path d="M12 5.2c1.9 1.5 4.1 2 5.6 1.8-.3 2.1-1.5 3.8-3.2 5 1 .7 1.8 1.8 2.1 3.1-1.8.1-3.4-.5-4.5-1.5-1.1 1-2.7 1.6-4.5 1.5.3-1.3 1.1-2.4 2.1-3.1-1.7-1.2-2.9-2.9-3.2-5 1.5.2 3.7-.3 5.6-1.8z" />
          <circle cx="12" cy="11.2" r="1.5" fill="#F5E6B8" />
        </g>
      );
    case "Colorless":
    default:
      return (
        <path
          fill={color}
          d="M12 5.2 13.1 10h4.9l-4 2.9 1.5 4.9L12 14.9 8.5 17.8 10 12.9 6 10h4.9L12 5.2z"
        />
      );
  }
}
