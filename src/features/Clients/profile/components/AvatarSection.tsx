import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { removeAvatar, setAvatarFromUrl, uploadAvatar } from "@/shared/api/me";
import Avatar from "@/shared/components/Avatar";
import { validateAvatarFile, validateAvatarUrl } from "../validation";
import { StatusMessage } from "./StatusMessage";
import { useStatus } from "./useStatus";

interface Props {
  name: string;
  avatarUrl: string | null;
  /** Se llama con la nueva ruta (o `null`) cuando el backend ya guardó el cambio. */
  onChange: (avatarUrl: string | null) => void;
}

type Busy = "upload" | "url" | "remove" | null;

export function AvatarSection({ name, avatarUrl, onChange }: Props) {
  const [busy, setBusy] = useState<Busy>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const { status, success, fail, clear } = useStatus();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function run(kind: Exclude<Busy, null>, action: () => Promise<string | null>, okText: string) {
    setBusy(kind);
    clear();
    try {
      onChange(await action());
      success(okText);
      return true;
    } catch (e) {
      fail(e);
      return false;
    } finally {
      setBusy(null);
      setProgress(0);
      setPreview(null);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    const problem = validateAvatarFile(file);
    if (problem) return fail(new Error(problem));
    setPreview(URL.createObjectURL(file)); // vista previa inmediata mientras sube
    await run("upload", () => uploadAvatar(file, setProgress), "Foto actualizada");
  }

  async function onUrl(e: FormEvent) {
    e.preventDefault();
    const problem = validateAvatarUrl(urlInput);
    if (problem) return fail(new Error(problem));
    if (await run("url", () => setAvatarFromUrl(urlInput.trim()), "Foto actualizada")) setUrlInput("");
  }

  const working = busy !== null;
  return (
    <div className="md:col-span-1">
      <div className="mb-2 text-xs opacity-70">Foto de perfil</div>
      <Avatar src={preview ?? avatarUrl} name={name || "Usuario"} size={128} className="border border-white/15" />

      {busy === "upload" && (
        <div
          className="mt-2 h-1.5 w-32 overflow-hidden rounded bg-white/10"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Subiendo foto"
        >
          <div className="h-full bg-[#e50914] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          onChange={onFile}
          aria-label="Elegir archivo de foto"
        />
        <button
          type="button"
          disabled={working}
          onClick={() => fileRef.current?.click()}
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-dashed border-white/25 bg-white/[0.04] px-3 py-2 text-sm transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> {busy === "upload" ? "Subiendo…" : "Subir foto"}
        </button>

        <form onSubmit={onUrl} className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 flex-none opacity-70" aria-hidden />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="o pega una URL https://…"
            aria-label="URL de la foto"
            disabled={working}
            className="h-11 min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 text-sm outline-none transition focus:border-[#e50914] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={working || !urlInput.trim()}
            className="h-11 rounded-md border border-white/15 bg-white/5 px-3 text-sm transition hover:bg-white/10 disabled:opacity-50"
          >
            {busy === "url" ? "…" : "Usar"}
          </button>
        </form>

        {avatarUrl && (
          <button
            type="button"
            disabled={working}
            onClick={() => void run("remove", async () => (await removeAvatar(), null), "Foto eliminada")}
            className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-red-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Quitar foto
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] opacity-60">JPG, PNG o WebP, hasta 2 MB. Se recorta a cuadrado.</p>
      <StatusMessage status={status} className="mt-1" />
    </div>
  );
}
