export function validateDatasetName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0;
}
