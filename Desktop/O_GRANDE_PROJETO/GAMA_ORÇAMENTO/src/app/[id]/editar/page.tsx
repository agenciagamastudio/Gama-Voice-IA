"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudioEditor from "@/components/StudioEditor";
import { getById } from "@/lib/storage";
import type { Orcamento } from "@/types/orcamento";

export default function EditarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [orc, setOrc] = useState<Orcamento | null>(null);

  useEffect(() => {
    const found = getById(id);
    if (!found) { router.push("/"); return; }
    setOrc(found);
  }, [id, router]);

  if (!orc) return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center text-slate-400 text-sm">
      Carregando...
    </div>
  );

  return <StudioEditor initial={orc} />;
}
