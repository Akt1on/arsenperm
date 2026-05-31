import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DynIcon({ name, className }: { name?: string | null; className?: string }) {
  const Cmp = (name && (Icons as any)[name]) as LucideIcon | undefined;
  const I = Cmp ?? Icons.Wrench;
  return <I className={className} />;
}
