#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');

// Fetch dynamic URLs from live site
async function fetchDynamicUrls() {
  const dynamicUrls = {
    blog: [],
    programs: [],
    services: []
  };

  try {
    // Fetch blog posts
    console.log('🔍 Fetching blog posts...');
    const blogResponse = await axios.get('https://elevateforhumanity.org/blog/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Sitemap-Generator/1.0' }
    });
    
    const $ = cheerio.load(blogResponse.data);
    
    // Extract blog post URLs
    $('a[href*="/blog/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/blog/') && !href.includes('?') && !href.includes('#')) {
        const cleanUrl = href.replace('https://elevateforhumanity.org', '');
        if (!dynamicUrls.blog.includes(cleanUrl)) {
          dynamicUrls.blog.push(cleanUrl);
        }
      }
    });

    console.log(`✅ Found ${dynamicUrls.blog.length} blog URLs`);

  } catch (error) {
    console.warn('⚠️  Could not fetch dynamic URLs:', error.message);
    console.log('📝 Using static URL configuration instead');
  }

  return dynamicUrls;
}

// Update URL configurations with dynamic content
async function updateUrlConfigs(baseConfigs) {
  const dynamicUrls = await fetchDynamicUrls();
  
  // Add dynamic blog URLs to content sitemap
  if (dynamicUrls.blog.length > 0) {
    const blogUrls = dynamicUrls.blog.slice(0, 50).map(url => ({
      url,
      priority: '0.6',
      changefreq: 'monthly'
    }));
    
    baseConfigs.content.urls = [
      ...baseConfigs.content.urls.filter(item => !item.url.includes('/blog/') || item.url === '/blog/'),
      ...blogUrls
    ];
    
    console.log(`📝 Updated content sitemap with ${blogUrls.length} blog posts`);
  }

  return baseConfigs;
}

module.exports = { fetchDynamicUrls, updateUrlConfigs };