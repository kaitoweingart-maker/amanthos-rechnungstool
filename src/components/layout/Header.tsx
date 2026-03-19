export function Header() {
  return (
    <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-base font-semibold leading-tight">Rechnungstool</h1>
          <p className="text-xs text-primary-foreground/70">Amanthos Group</p>
        </div>
      </div>
      <button
        onClick={() => {
          sessionStorage.removeItem('amanthos-auth')
          window.location.reload()
        }}
        className="text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors px-3 py-1 rounded-md hover:bg-white/10"
      >
        Abmelden
      </button>
    </header>
  )
}
