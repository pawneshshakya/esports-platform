import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/events/EventDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getEvent(id);
  const event = data?.event;

  if (!event) {
    return { title: "Event Not Found | Esports Pro" };
  }

  return {
    title: `${event.title} - ${event.game.toUpperCase()} Tournament`,
    description: event.description?.substring(0, 160) || "Join this tournament",
    openGraph: {
      title: event.title,
      description: `Join this ${event.game} tournament with ₹${event.prizePool?.total || 0} prize pool!`,
      type: "article",
      images: event.coverImage ? [{ url: event.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description?.substring(0, 160),
    },
    alternates: {
      canonical: `/events/${id}`,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const data = await getEvent(id);

  if (!data?.event) {
    notFound();
  }

  return <EventDetailClient initialData={data} eventId={id} />;
}