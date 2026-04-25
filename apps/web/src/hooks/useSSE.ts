"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useSSE() {
  const { token, user } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!token || eventSourceRef.current?.readyState === EventSource.OPEN) return;

    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sse/stream?token=${token}`
    );

    es.onopen = () => {
      console.log("SSE Connected");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connected") return;
        handleSSEEvent(data, queryClient);
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    es.onerror = () => {
      console.log("SSE Error, reconnecting...");
      es.close();
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    eventSourceRef.current = es;
  }, [token, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return eventSourceRef;
}

function handleSSEEvent(data: any, queryClient: any) {
  switch (data.type) {
    case "notification": {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info(data.data.title, {
        description: data.data.message,
        action: data.data.actionUrl
          ? {
            label: "View",
            onClick: () => (window.location.href = data.data.actionUrl),
          }
          : undefined,
      });
      break;
    }

    case "wallet_credit":
    case "wallet_debit": {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(data.data.title, { description: data.data.message });
      break;
    }

    case "player_joined": {
      queryClient.invalidateQueries({ queryKey: ["room", data.data.roomId] });
      toast.info(`${data.data.username} joined the room`);
      break;
    }

    case "screenshot_uploaded": {
      queryClient.invalidateQueries({ queryKey: ["screenshots", data.data.roomId] });
      toast.warning("New Screenshot!", {
        description: data.data.message,
        duration: 10000,
      });
      break;
    }

    case "verification_update": {
      queryClient.invalidateQueries({ queryKey: ["screenshots"] });
      break;
    }

    case "mediator_timer": {
      queryClient.setQueryData(["mediator_status", data.data.roomId], {
        timeLeft: data.data.timeLeft,
        status: "reviewing",
      });
      break;
    }

    case "room_resolved": {
      queryClient.invalidateQueries({ queryKey: ["room", data.data.roomId] });
      toast.success("Match Resolved!", {
        description: `Winner: ${data.data.winnerId}`,
      });
      break;
    }

    case "new_approval_request": {
      toast.info("New Approval Request", {
        description: `Event: ${data.data.title} by ${data.data.creator}`,
      });
      break;
    }
  }
}