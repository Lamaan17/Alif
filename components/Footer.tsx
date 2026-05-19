export default function Footer() {
  return (
    <footer className="border-t border-paper-line">
      <div className="container-prose flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-baseline gap-2">
          <span className="wordmark">alif</span>
          <span className="text-lg font-medium text-ink-muted">build</span>
          <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Part of the ALIF ecosystem
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <a href="/for-alif" className="transition-colors hover:text-ink">
            For ALIF
          </a>
          <a href="#" className="transition-colors hover:text-ink">
            About ALIF
          </a>
          <a href="#" className="transition-colors hover:text-ink">
            Code of conduct
          </a>
          <a href="#" className="transition-colors hover:text-ink">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-ink">
            Contact
          </a>
        </nav>

        <div className="text-xs text-ink-muted/70">
          &copy; {new Date().getFullYear()} ALIF
        </div>
      </div>
    </footer>
  );
}
