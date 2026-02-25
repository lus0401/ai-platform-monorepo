export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return (
    <div>
      <h1>고객사 상세: {customerId}</h1>
    </div>
  );
}
