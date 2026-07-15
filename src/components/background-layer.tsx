export function BackgroundLayer({ imageKey }: { imageKey: string }) {
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
      <div className="pointer-events-none absolute inset-0 bg-background/55 backdrop-blur-sm" />
    </>
  );
}
