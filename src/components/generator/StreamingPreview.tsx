function extractPreviewText(buffer: string): string {
  const idx = buffer.indexOf('"variations":["')
  if (idx === -1) return ''
  const textStart = idx + '"variations":["'.length
  const remaining = buffer.slice(textStart)
  let end = -1
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i] === '"' && remaining[i - 1] !== '\\') {
      end = i
      break
    }
  }
  const raw = end === -1 ? remaining : remaining.slice(0, end)
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

interface StreamingPreviewProps {
  buffer: string
}

export function StreamingPreview({ buffer }: StreamingPreviewProps) {
  const text = extractPreviewText(buffer)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-text-primary">Generated Content</h2>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md bg-accent-muted text-text-accent border border-accent/20">
          <span className="w-1.5 h-1.5 rounded-full bg-text-accent animate-pulse" />
          Generating…
        </span>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          LinkedIn · Preview
        </p>
        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap min-h-[4rem]">
          {text ? (
            <>
              {text}
              <span className="inline-block w-[2px] h-[1em] ml-px bg-text-accent align-middle animate-pulse" aria-hidden />
            </>
          ) : (
            <span className="text-text-muted">
              AI is writing your content…
              <span className="inline-block w-[2px] h-[1em] ml-px bg-text-muted align-middle animate-pulse" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
