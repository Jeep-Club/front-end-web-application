import RootComponent from "@/components/pages/root";

export default function Root() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex h-dvh w-full flex-col items-center justify-center gap-y-14">
        <header className="flex items-center justify-center gap-5">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            JeepClub
          </h1>
          <RootComponent />
        </header>
      </main>
    </div>
  );
}
