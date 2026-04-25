
// apps/web/src/components/events/ShareButtons.tsx
'use client';

interface Props {
  eventId: string;
  title: string;
}

export const ShareButtons = ({ eventId, title }: Props) => {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/join/${eventId}`;
  const text = `Join my tournament: ${title}`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // toast
  };

  return (
    <div className="flex gap-2">
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" 
         className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30">
        WhatsApp
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
         className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30">
        Twitter
      </a>
      <button onClick={copyLink} className="p-2 bg-muted text-gray-300 rounded-lg hover:bg-gray-600">
        Copy Link
      </button>
    </div>
  );
};