"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  progress: number;
  eta: string | null;
  status: "Running" | "Succeeded" | "Failed";
}

interface UseTrainingSocketOptions {
  onProgress?: (data: TrainingProgress) => void;
  onCompleted?: (data: TrainingProgress) => void;
  onError?: (error: Event) => void;
  maxRetries?: number;
}

const WS_BASE =
  process.env.NEXT_PUBLIC_API_WS_URL ?? "ws://localhost:8080";

export function useTrainingSocket(
  jobId: string | null,
  options: UseTrainingSocketOptions = {}
) {
  const { onProgress, onCompleted, onError, maxRetries = 3 } = options;

  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const jobIdRef = useRef(jobId);

  const connect = useCallback(() => {
    if (!jobIdRef.current) return;

    const ws = new WebSocket(`${WS_BASE}/ws/training/${jobIdRef.current}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: TrainingProgress = JSON.parse(event.data);
        setProgress(data);
        onProgress?.(data);

        if (data.status === "Succeeded" || data.status === "Failed") {
          onCompleted?.(data);
          ws.close();
        }
      } catch {
        // JSON 파싱 실패 무시
      }
    };

    ws.onclose = () => {
      setIsConnected(false);

      // 완료/실패가 아닌 경우 재연결 시도
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        const delay = retriesRef.current * 1000; // 1s, 2s, 3s
        setTimeout(connect, delay);
      }
    };

    ws.onerror = (event) => {
      onError?.(event);
    };
  }, [maxRetries, onProgress, onCompleted, onError]);

  useEffect(() => {
    jobIdRef.current = jobId;

    if (!jobId) return;

    retriesRef.current = 0;
    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [jobId, connect]);

  const disconnect = useCallback(() => {
    retriesRef.current = maxRetries; // 재연결 차단
    wsRef.current?.close();
  }, [maxRetries]);

  return { progress, isConnected, disconnect };
}
