export default async function InferenceAnalysisPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return (
    <div>
      <h1>추론 분석: {jobId}</h1>
    </div>
  );
}
