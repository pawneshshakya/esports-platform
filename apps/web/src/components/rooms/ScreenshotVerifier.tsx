
// apps/web/src/components/room/ScreenshotVerifier.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Image from 'next/image';

interface Props {
  roomId: string;
}

export const ScreenshotVerifier = ({ roomId }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/rooms/${roomId}/screenshot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Screenshot uploaded!');
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ index, action }: { index: number; action: string }) => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/rooms/screenshot/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roomId, screenshotIndex: index, action })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    }
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-xl font-bold text-white mb-4">Screenshot Verification</h3>
      
      {/* Upload Section */}
      {room.status === 'screenshot_upload' || room.status === 'ongoing' ? (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-border">
          <input
            type="file"
            accept="image/*"
            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary text-primary-foreground file:text-white hover:file:bg-purple-700"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Screenshot'}
          </button>
        </div>
      ) : null}

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {room.screenshots?.map((screenshot: any, index: number) => (
          <div key={index} className="bg-muted rounded-lg overflow-hidden border border-border">
            <div className="relative aspect-video">
              <Image
                src={screenshot.imageUrl}
                alt={`Screenshot ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  By: {screenshot.uploadedByName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(screenshot.uploadedAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Voting Buttons */}
              {room.status === 'voting' || room.status === 'screenshot_upload' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => verifyMutation.mutate({ index, action: 'like' })}
                    className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✅ Verify ({screenshot.likes?.length || 0})
                  </button>
                  <button
                    onClick={() => verifyMutation.mutate({ index, action: 'dislike' })}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ❌ Dispute ({screenshot.dislikes?.length || 0})
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  {screenshot.likes?.length || 0} verifications
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mediator Timer */}
      {room.status === 'mediator_review' && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-center font-medium">
            ⏱️ Mediator Review in Progress
          </p>
        </div>
      )}
    </div>
  );
};