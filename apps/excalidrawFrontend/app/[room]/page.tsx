import { CanvasComponent } from "@/components/Canvas";

export default async function Home({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  return (
    <div>
      <CanvasComponent roomId={room} />
    </div>
  );
}
