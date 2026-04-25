import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ slug: string }>;
}

async function getBlog(slug: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${slug}`, {
            cache: "no-store",
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getBlog(slug);
    const blog = data?.blog;

    if (!blog) {
        return { title: "Blog Not Found | Esports Pro" };
    }

    return {
        title: `${blog.title} | Esports Pro Blog`,
        description: blog.excerpt?.substring(0, 160) || blog.metaDescription,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            type: "article",
            images: blog.coverImage ? [{ url: blog.coverImage }] : [],
        },
        alternates: {
            canonical: `/blogs/${slug}`,
        },
    };
}

export default async function BlogPage({ params }: Props) {
    const { slug } = await params;
    const data = await getBlog(slug);

    if (!data?.blog) {
        notFound();
    }

    const blog = data.blog;

    return (
        <article className="min-h-screen bg-background text-white py-12">
            <div className="max-w-4xl mx-auto px-4">
                {blog.coverImage && (
                    <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-64 object-cover rounded-xl mb-8"
                    />
                )}

                <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-8">
                    <span>By {blog.author?.name}</span>
                    <span>•</span>
                    <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{blog.views} views</span>
                </div>

                <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </div>
        </article>
    );
}