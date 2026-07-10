export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground">
        <span>Vipa Cursos &copy; {new Date().getFullYear()}</span>
        <span>Meditación Vipassana</span>
      </div>
    </footer>
  );
}
