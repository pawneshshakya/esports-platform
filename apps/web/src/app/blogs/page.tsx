import Link from 'next/link';

async function getBlogs() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
            cache: 'no-store'
        });
        return res.json();
    } catch (error) {
        return { blogs: [] };
    }
}

export default async function BlogsPage() {
    const data = await getBlogs();
    const blogs = data.blogs || [];

    return (
        <div className="min-h-screen bg-background text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                        Gaming Insights
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Tips, strategies, and updates from the world of competitive gaming
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-white mb-2">No blogs yet</h3>
                        <p className="text-muted-foreground">Check back soon for gaming content!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog: any) => (
                            <Link
                                key={blog._id}
                                href={`/blogs/${blog.slug}`}
                                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
                            >
                                {blog.coverImage && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={blog.coverImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-primary text-primary-foreground/20 text-primary text-xs font-bold px-2 py-1 rounded">
                                            {blog.category}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {new Date(blog.publishedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                        {blog.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={blog.author?.avatar || '/default-avatar.png'}
                                            alt={blog.author?.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm text-muted-foreground">{blog.author?.name}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}