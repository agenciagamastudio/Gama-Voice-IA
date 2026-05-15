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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)", fontSize: 14 }}>
      Carregando...
    </div>
  );

  return <StudioEditor initial={orc} />;
}
