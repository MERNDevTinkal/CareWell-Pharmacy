import adminApi from './adminApi';

export const cmsService = {
  // Pages
  getPages: () => adminApi.get('/cms/pages'),
  getPage: (id) => adminApi.get(`/cms/pages/id/${id}`),
  createPage: (data) => adminApi.post('/cms/pages', data),
  updatePage: (id, data) => adminApi.put(`/cms/pages/${id}`, data),
  deletePage: (id) => adminApi.delete(`/cms/pages/${id}`),

  // FAQs
  getFAQs: () => adminApi.get('/cms/faqs/all'),
  createFAQ: (data) => adminApi.post('/cms/faqs', data),
  updateFAQ: (id, data) => adminApi.put(`/cms/faqs/${id}`, data),
  deleteFAQ: (id) => adminApi.delete(`/cms/faqs/${id}`),

  // Blogs
  getBlogs: () => adminApi.get('/cms/blogs/admin/all'),
  createBlog: (data) => adminApi.post('/cms/blogs', data),
  updateBlog: (id, data) => adminApi.put(`/cms/blogs/${id}`, data),
  deleteBlog: (id) => adminApi.delete(`/cms/blogs/${id}`)
};
