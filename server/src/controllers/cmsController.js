const CMSPage = require('../models/CMSPage');
const FAQ = require('../models/FAQ');
const BlogPost = require('../models/BlogPost');
const slugify = require('slugify');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// --- CMS Pages ---
exports.getPublicPage = async (req, res) => {
  try {
    const page = await CMSPage.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) return sendError(res, 'Page not found', 404);
    sendSuccess(res, page);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getAllPages = async (req, res) => {
  try {
    const pages = await CMSPage.find().sort({ updatedAt: -1 });
    sendSuccess(res, pages);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getPageById = async (req, res) => {
  try {
    const page = await CMSPage.findById(req.params.id);
    if (!page) return sendError(res, 'Page not found', 404);
    sendSuccess(res, page);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createPage = async (req, res) => {
  try {
    const { title, slug, content, type, isPublished, seo } = req.body;
    if (!title) return sendError(res, 'Title is required');

    const generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });
    const existing = await CMSPage.findOne({ slug: generatedSlug });
    if (existing) return sendError(res, 'Page with this slug already exists');

    const page = await CMSPage.create({
      title,
      slug: generatedSlug,
      content: content || '',
      type: type || 'custom',
      isPublished: isPublished !== undefined ? isPublished : true,
      seo: seo || {},
      updatedBy: req.admin?._id
    });

    sendSuccess(res, page, 'Page created successfully', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { title, slug, content, type, isPublished, seo } = req.body;
    const page = await CMSPage.findById(req.params.id);
    if (!page) return sendError(res, 'Page not found', 404);

    if (slug && slug !== page.slug) {
      const generatedSlug = slugify(slug, { lower: true, strict: true });
      const existing = await CMSPage.findOne({ slug: generatedSlug, _id: { $ne: page._id } });
      if (existing) return sendError(res, 'Slug already in use');
      page.slug = generatedSlug;
    }

    if (title) page.title = title;
    if (content !== undefined) page.content = content;
    if (type) page.type = type;
    if (isPublished !== undefined) page.isPublished = isPublished;
    if (seo) page.seo = seo;
    page.updatedBy = req.admin?._id;

    await page.save();
    sendSuccess(res, page, 'Page updated successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await CMSPage.findById(req.params.id);
    if (!page) return sendError(res, 'Page not found', 404);
    await page.deleteOne();
    sendSuccess(res, null, 'Page deleted successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// --- FAQs ---
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ order: 1, createdAt: 1 });
    sendSuccess(res, faqs);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    sendSuccess(res, faqs);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order, isPublished } = req.body;
    if (!question || !answer) return sendError(res, 'Question and answer are required');

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    sendSuccess(res, faq, 'FAQ created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return sendError(res, 'FAQ not found', 404);
    sendSuccess(res, faq, 'FAQ updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return sendError(res, 'FAQ not found', 404);
    await faq.deleteOne();
    sendSuccess(res, null, 'FAQ deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// --- Blogs ---
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 6, category } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;

    const pg = parseInt(page);
    const lm = parseInt(limit);
    const skip = (pg - 1) * lm;

    const [blogs, total] = await Promise.all([
      BlogPost.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(lm).lean(),
      BlogPost.countDocuments(query)
    ]);

    sendPaginated(res, blogs, total, pg, lm);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
    if (!blog) return sendError(res, 'Article not found', 404);

    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();

    sendSuccess(res, blog);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    sendSuccess(res, blogs);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImage, author, category, tags, isPublished, readTime, seo } = req.body;
    if (!title) return sendError(res, 'Title is required');

    const generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });
    const existing = await BlogPost.findOne({ slug: generatedSlug });
    if (existing) return sendError(res, 'Slug already in use');

    const blog = await BlogPost.create({
      title,
      slug: generatedSlug,
      excerpt,
      content,
      coverImage,
      author: author || { name: req.admin?.name || 'CareWell Health Team' },
      category: category || 'Health & Wellness',
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : false,
      publishedAt: isPublished ? new Date() : undefined,
      readTime: readTime || 5,
      seo: seo || {}
    });

    sendSuccess(res, blog, 'Article created', 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) return sendError(res, 'Article not found', 404);

    if (req.body.isPublished && !blog.isPublished && !blog.publishedAt) {
      req.body.publishedAt = new Date();
    }

    Object.assign(blog, req.body);
    await blog.save();

    sendSuccess(res, blog, 'Article updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) return sendError(res, 'Article not found', 404);
    await blog.deleteOne();
    sendSuccess(res, null, 'Article deleted');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
