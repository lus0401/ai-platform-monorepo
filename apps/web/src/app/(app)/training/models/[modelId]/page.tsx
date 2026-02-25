export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>;
}) {
  const { modelId } = await params;
  return (
    <div>
      <h1>모델 상세: {modelId}</h1>
    </div>
  );
}
