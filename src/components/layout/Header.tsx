export function Header() {
  return (
    <header className="border-b bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Rechnungstool</h1>
        <p className="text-xs text-muted-foreground">Amanthos Hotel AG</p>
      </div>
      <button
        onClick={() => {
          sessionStorage.removeItem('amanthos-auth')
          window.location.reload()
        }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Abmelden
      </button>
    </header>
  )
}
