import {
  Globe,
  Palette,
  Zap,
  Triangle,
  Server,
  BookOpen,
  Code2,
  Database,
  GitBranch,
  Lock,
  Layout,
  Cpu,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

// Map emoji / backend icon string → Lucide component + color override
const ICON_MAP: Record<string, LucideIcon> = {
  "🌐": Globe,
  "🎨": Palette,
  "⚡": Zap,
  "🔺": Triangle,
  "🔴": Server,
  "🛠️": Code2,
  "📦": Layout,
  "💻": Cpu,
  // extras in case backend adds more
  globe: Globe,
  palette: Palette,
  zap: Zap,
  triangle: Triangle,
  server: Server,
  book: BookOpen,
  code: Code2,
  database: Database,
  git: GitBranch,
  lock: Lock,
  layout: Layout,
  cpu: Cpu,
  layers: Layout,
  terminal: Server,
  box: Layout,
  graduation: GraduationCap,
};

const DEFAULT_ICON = BookOpen;

interface ModuleIconProps {
  icon: string;
  imageUrl?: string | null;
  size?: number;
  /** Icon stroke color. Defaults to white (for use inside colored containers). */
  color?: string;
  className?: string;
}

export default function ModuleIcon({ icon, imageUrl, size = 28, color = "white", className }: ModuleIconProps) {
  if (imageUrl) {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage';
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${storageUrl}/${imageUrl}`;
    return (
      <img 
        src={fullUrl} 
        alt="Module icon" 
        className={`w-full h-full object-contain ${className || ""}`}
      />
    );
  }

  const Icon = ICON_MAP[icon] ?? DEFAULT_ICON;
  return <Icon size={size} color={color} className={className} strokeWidth={1.8} />;
}
