import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const ACCESS_CODE = 'amanthos2024'

interface LoginScreenProps {
  onSuccess: () => void
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code === ACCESS_CODE) {
      setError(false)
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Rechnungstool</h1>
            <p className="text-sm text-muted-foreground mt-1">Amanthos Hotel AG</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">Zugangscode</Label>
              <Input
                id="code"
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(false)
                }}
                placeholder="Code eingeben..."
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="text-xs text-destructive">
                  Falscher Code. Bitte erneut versuchen.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
