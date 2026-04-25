import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://yourdomain.com";

    // Static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/subscription`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    // Dynamic event routes (fetch from API)
    try {
        const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            const eventRoutes = eventsData.events?.map((event: any) => ({
                url: `${baseUrl}/events/${event._id}`,
                lastModified: new Date(event.updatedAt),
                changeFrequency: "daily" as const,
                priority: 0.9,
            })) || [];

            routes.push(...eventRoutes);
        }
    } catch (error) {
        console.error("Failed to fetch events for sitemap:", error);
    }

    // Dynamic blog routes
    try {
        const blogsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
            next: { revalidate: 3600 },
        });

        if (blogsRes.ok) {
            const blogsData = await blogsRes.json();
            const blogRoutes = blogsData.blogs?.map((blog: any) => ({
                url: `${baseUrl}/blogs/${blog.slug}`,
                lastModified: new Date(blog.publishedAt || blog.updatedAt),
                changeFrequency: "weekly" as const,
                priority: 0.7,
            })) || [];

            routes.push(...blogRoutes);
        }
    } catch (error) {
        console.error("Failed to fetch blogs for sitemap:", error);
    }

    return routes;
}