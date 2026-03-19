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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/20 px-4">
      <Card className="w-full max-w-sm shadow-xl border-0">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 shadow-lg">
              A
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Rechnungstool</h1>
            <p className="text-sm text-muted-foreground mt-1">Amanthos Group</p>
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
                className="h-11"
              />
              {error && (
                <p className="text-xs text-destructive">
                  Falscher Code. Bitte erneut versuchen.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full h-11 font-semibold">
              Anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
