'use client'

// Fixed, purely decorative "QR-like" pattern — not a real scannable code.
// Scanning is simulated with the button below it.
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
]

interface QrScanMockProps {
  scanned: boolean
  onScan: () => void
}

export function QrScanMock({ scanned, onScan }: QrScanMockProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-4 bg-muted text-center">
      <p className="text-xs text-muted-foreground">
        Scan this code with your banking / wallet app to confirm payment.
      </p>
      <div className="grid grid-cols-[repeat(13,1fr)] gap-[1px] bg-white p-2 rounded-md border border-border w-fit">
        {QR_PATTERN.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`h-2 w-2 ${cell ? 'bg-aegean-dark' : 'bg-white'}`}
            />
          ))
        )}
      </div>
      {!scanned ? (
        <button
          type="button"
          onClick={onScan}
          className="text-sm font-bold text-foreground underline hover:text-aegean-green transition-colors cursor-pointer"
        >
          Tap to Simulate Scan
        </button>
      ) : (
        <p className="text-sm font-bold text-aegean-green-text">
          ✓ Payment confirmed — This is a Stavros Vetsikas project
        </p>
      )}
    </div>
  )
}
