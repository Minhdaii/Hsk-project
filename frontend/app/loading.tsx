import ChainaStrokeLoading from '@/components/ChainaStrokeLoading';

export default function Loading() {
  return (
    <main className="min-h-[60svh] bg-paper grid place-items-center">
      <ChainaStrokeLoading mode="PAGE" />
    </main>
  );
}
