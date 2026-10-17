import api from './api';

export const cmsService = {
  getPage: (slug) => api.get(`/cms/pages/${slug}`),
  getFAQs: () => api.get('/cms/faqs'),
  getBlogs: (params) => api.get('/cms/blogs', { params }),
  getBlog: (slug) => api.get(`/cms/blogs/${slug}`),
};
