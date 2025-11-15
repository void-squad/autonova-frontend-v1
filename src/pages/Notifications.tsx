import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Notification as NotificationType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationsApi } from '@/Api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery<NotificationType[]>({
    queryKey: ['notifications', userId],
    queryFn: () => notificationsApi.getNotifications(userId as string | number),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  const notifications = query.data ?? [];

  // No local 'seen' state: user requested to remove 'seen' behavior.

  // Helper to get stable id (backend may include messageId)
  const idOf = (n: NotificationType) => ((n as any).messageId ?? n.id) as string;

  // Sort notifications: unread first, then newest first
  const displayNotifications = useMemo(() => {
    return [...notifications].slice().sort((a: NotificationType, b: NotificationType) => {
      if (a.read !== b.read) return a.read ? 1 : -1; // unread first
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });
  }, [notifications]);

  useEffect(() => {
    if (!userId) return;

    // Build list of event types to listen for: 'message', 'heartbeat', plus any eventType values
    const eventTypes = new Set<string>(['message', 'heartbeat']);
    (notifications ?? []).forEach((n) => {
      const ev = (n as any)?.eventType;
      if (ev) eventTypes.add(ev);
    });

    const unsubscribe = notificationsApi.subscribe(
      userId as string | number,
      (msg) => {
        const m = msg as any;
        if (!m) return;
        const eventType = m?.eventType ?? m?.type;
        const messageText = m?.message ?? m?.title ?? '';
        if (eventType === 'heartbeat' || String(messageText).toLowerCase() === 'keepalive') {
          return;
        }

        // prepend to cache avoiding duplicates
        queryClient.setQueryData<NotificationType[]>(['notifications', userId], (old = []) => {
          const exists = old.some((o: any) => {
            if (m?.id && o.id === m.id) return true;
            if (m?.messageId && (o as any).messageId === m.messageId) return true;
            return false;
          });
          if (exists) return old;
          return [m, ...old];
        });
      },
      Array.from(eventTypes)
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Mutations: mark single as read
  const markReadFn = (id: string) => notificationsApi.markRead(id);
  const markReadMutation = useMutation({
    mutationFn: markReadFn,
    onMutate: async (id: string) => {
      if (!userId) return { previous: null };
      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });
      const previous = queryClient.getQueryData<NotificationType[]>(['notifications', userId]);
      queryClient.setQueryData<NotificationType[]>(['notifications', userId], (old = []) =>
        old.map((n) => {
          // mark as read if backend id matches OR messageId matches the provided id
          const nid = n.id as string;
          const mid = (n as any).messageId as string | undefined;
          if (nid === id || mid === id) return { ...n, read: true } as NotificationType;
          return n;
        })
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications', userId], context.previous);
      }
    },
    onSettled: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Mutation: mark all as read for the user
  const markAllFn = () => notificationsApi.markAllRead(userId as string | number);
  const markAllMutation = useMutation({
    mutationFn: markAllFn,
    onMutate: async () => {
      if (!userId) return { previous: null };
      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });
      const previous = queryClient.getQueryData<NotificationType[]>(['notifications', userId]);
      queryClient.setQueryData<NotificationType[]>(['notifications', userId], (old = []) =>
        old.map((n) => ({ ...n, read: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications', userId], context.previous);
      }
    },
    onSettled: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.status === 'pending' || notifications.length === 0}
          >
            Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {displayNotifications.length === 0 ? (
          <div className="text-muted-foreground">No notifications</div>
        ) : (
          displayNotifications.map((n) => {
            const key = idOf(n);
            const isUnread = !n.read;
            return (
              <div
                key={key}
                className={`p-3 rounded-md border ${n.read ? 'bg-white' : isUnread ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{(n as any).title ?? n.type}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                    </div>
                    {!n.read && (
                      <Button
                        size="sm"
                        onClick={() => markReadMutation.mutate(n.id)}
                        disabled={markReadMutation.status === 'pending'}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
