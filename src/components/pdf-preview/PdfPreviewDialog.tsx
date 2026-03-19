import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PdfPreviewDialogProps {
  open: boolean
  onClose: () => void
  pdfUrl: string | null
  filename: string
}

export function PdfPreviewDialog({
  open,
  onClose,
  pdfUrl,
  filename,
}: PdfPreviewDialogProps) {
  function handleDownload() {
    if (!pdfUrl) return
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = filename
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-4xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>PDF Vorschau</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded border"
              title="PDF Vorschau"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Wird geladen...
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Schliessen
          </Button>
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            Herunterladen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
