export type Session = {
  user?: { id: string; name?: string; email?: string };
  expires?: string;
};

export function getSession(): Session | null {
  return null;
}
