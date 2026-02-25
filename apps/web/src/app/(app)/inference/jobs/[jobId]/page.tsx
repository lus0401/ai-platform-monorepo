export default async function InferenceJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div>
      <h1>추론 작업 상세: {jobId}</h1>
    </div>
  );
}
