export function BackgroundLayer({ imageKey }: { imageKey: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/background/${imageKey}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-background/55 backdrop-blur-sm" />
    </>
  );
}
