"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateDatasetForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [sourceType, setSourceType] = useState(0); // 0=Other 가정
  const [createdByUserId, setCreatedByUserId] = useState(
    "00000000-0000-0000-0000-000000000000"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/platform/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() ? description.trim() : null,
          sourceType,
          location: location.trim() ? location.trim() : null,
          createdByUserId,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        // 서버가 JSON이든 텍스트든 일단 보여주기
        throw new Error(`POST failed (${res.status}): ${text}`);
      }

      setOkMsg("Created!");
      setName("");
      setDescription("");
      setLocation("");
      // 목록 새로고침 (Server Component 재-fetch)
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <label style={{ display: "grid", gap: 4 }}>
        <span>Name *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., PLC main tank data"
          style={{ padding: 8 }}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Description</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="optional"
          style={{ padding: 8 }}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>Location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., opcua://plc1 or file path"
          style={{ padding: 8 }}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>SourceType</span>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(Number(e.target.value))}
          style={{ padding: 8 }}
        >
          <option value={0}>Other (0)</option>
          <option value={1}>PLC (1)</option>
          <option value={2}>CSV (2)</option>
          <option value={3}>DB (3)</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>CreatedByUserId</span>
        <input
          value={createdByUserId}
          onChange={(e) => setCreatedByUserId(e.target.value)}
          style={{ padding: 8 }}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ padding: 10, cursor: isSubmitting ? "not-allowed" : "pointer" }}
      >
        {isSubmitting ? "Creating..." : "Create"}
      </button>

      {error && (
        <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</div>
      )}
      {okMsg && <div style={{ color: "green" }}>{okMsg}</div>}
    </form>
  );
}