export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-forest mb-4">You're Offline</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        It seems you've lost your internet connection. But don't worry, you can still browse the last synced menu!
      </p>
      <a href="/menu" className="bg-gold text-forest font-semibold px-8 py-3 rounded-full hover:bg-gold/90 transition-colors">
        View Menu
      </a>
    </div>
  );
}
