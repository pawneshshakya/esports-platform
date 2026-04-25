
// apps/api/src/controllers/blog.controller.ts
import { Response } from 'express';
import slugify from 'slugify'; // npm install slugify
import { AuthRequest } from '../middleware/auth';
import { Blog } from '../models/Blog';
import { Notification } from '../models/Notification';
import { sseService } from '../services/sse.service';

export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'partner' && req.user!.userType !== 'admin') {
      return res.status(403).json({ error: 'Only partners can create blogs' });
    }

    const { title, content, excerpt, category, tags, coverImage, metaTitle, metaDescription } = req.body;
    
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      coverImage,
      author: req.user!._id,
      status: 'draft',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt.substring(0, 160)
    });

    await blog.save();
    res.json({ success: true, blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitForApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId, author: req.user!._id });
    
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    
    blog.status = 'pending';
    blog.submittedAt = new Date();
    await blog.save();

    // Notify admins (simplified - broadcast to admin channel)
    sseService.broadcastToEvent('admin_channel', {
      type: 'new_blog_approval',
      data: { blogId: blog._id, title: blog.title, author: req.user!.name }
    });

    res.json({ success: true, message: 'Submitted for approval' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reviewBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { blogId } = req.params;
    const { status, notes } = req.body; // status: 'published' | 'rejected'

    const blog = await Blog.findById(blogId).populate('author');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    blog.status = status;
    blog.reviewedBy = req.user!._id as any;
    blog.reviewNotes = notes;
    
    if (status === 'published') {
      blog.publishedAt = new Date();
    }

    await blog.save();

    // Notify author
    await Notification.create({
      recipient: blog.author._id,
      type: 'system',
      title: `Blog ${status === 'published' ? 'Approved' : 'Rejected'}`,
      message: `Your blog "${blog.title}" has been ${status}`,
      priority: 'high'
    });

    sseService.sendNotification(blog.author._id.toString(), {
      type: 'system',
      title: `Blog ${status}`,
      message: `"${blog.title}" is now ${status}`
    });

    res.json({ success: true, blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, page = 1, author } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    
    // Non-admins can only see published
    if (req.user!.userType !== 'admin') {
      query.status = 'published';
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name username avatar')
      .sort({ publishedAt: -1 })
      .skip((+page - 1) * 10)
      .limit(10);

    res.json({ blogs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name username avatar');
    
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};