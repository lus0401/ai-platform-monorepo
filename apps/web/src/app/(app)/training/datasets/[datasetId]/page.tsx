export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  return (
    <div>
      <h1>데이터셋 상세: {datasetId}</h1>
    </div>
  );
}
