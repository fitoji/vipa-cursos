export function BackgroundLayer({
  imageKey,
  overlayOpacity = 55,
}: {
  imageKey: string;
  overlayOpacity?: number;
}) {
  const opacity = Math.min(100, Math.max(0, overlayOpacity));
  const opacityClass = opacity / 100;
  const showBlur = opacity >= 30;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={`/background/${imageKey}`}
          alt=""
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: `oklch(var(--background) / ${opacityClass})`,
          backdropFilter: showBlur ? "blur(4px)" : "none",
        }}
      />
    </>
  );
}
