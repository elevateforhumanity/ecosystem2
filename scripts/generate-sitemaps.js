#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const DOMAIN = 'https://elevateforhumanity.org';
const OUTPUT_DIR = path.join(__dirname, '../public');
const SITEMAPS_DIR = path.join(OUTPUT_DIR, 'sitemaps');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SITEMAPS_DIR)) fs.mkdirSync(SITEMAPS_DIR, { recursive: true });

// Current timestamp
const now = new Date().toISOString();

// URL configurations with priorities and change frequencies
const urlConfigs = {
  core: {
    urls: [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about/', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact/', priority: '0.8', changefreq: 'monthly' },
      { url: '/accessibility/', priority: '0.5', changefreq: 'yearly' },
      { url: '/grants/', priority: '0.7', changefreq: 'monthly' },
      { url: '/veterans/', priority: '0.7', changefreq: 'monthly' },
      { url: '/partners/', priority: '0.7', changefreq: 'monthly' }
    ]
  },
  programs: {
    urls: [
      { url: '/programs/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/cybersecurity/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/cybersecurity/curriculum/', priority: '0.7', changefreq: 'monthly' },
      { url: '/programs/cybersecurity/schedule/', priority: '0.7', changefreq: 'monthly' },
      { url: '/programs/cloud-computing/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/cloud-computing/curriculum/', priority: '0.7', changefreq: 'monthly' },
      { url: '/programs/cloud-computing/schedule/', priority: '0.7', changefreq: 'monthly' },
      { url: '/programs/healthcare-cna/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/beauty-wellness/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/construction/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/electrical-trades/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/data-analytics/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/healthcare-administration/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/medical-assistant/', priority: '0.9', changefreq: 'weekly' },
      { url: '/programs/skilled-trades/', priority: '0.9', changefreq: 'weekly' }
    ]
  },
  content: {
    urls: [
      { url: '/blog/', priority: '0.8', changefreq: 'weekly' },
      { url: '/blog/cybersecurity-career-guide/', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog/cloud-computing-trends/', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog/healthcare-job-outlook/', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog/skilled-trades-opportunities/', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog/wioa-funding-guide/', priority: '0.6', changefreq: 'monthly' },
      { url: '/policies/privacy/', priority: '0.5', changefreq: 'yearly' },
      { url: '/policies/terms/', priority: '0.5', changefreq: 'yearly' },
      { url: '/policies/refund/', priority: '0.5', changefreq: 'yearly' },
      { url: '/policies/compliance/', priority: '0.5', changefreq: 'yearly' },
      { url: '/policies/wioa-compliance/', priority: '0.5', changefreq: 'yearly' },
      { url: '/services/apprenticeship-coordination/', priority: '0.7', changefreq: 'monthly' },
      { url: '/services/certification-programs/', priority: '0.7', changefreq: 'monthly' },
      { url: '/services/employer-partnerships/', priority: '0.7', changefreq: 'monthly' },
      { url: '/resources/career-services/', priority: '0.6', changefreq: 'monthly' },
      { url: '/resources/financial-aid/', priority: '0.6', changefreq: 'monthly' }
    ]
  },
  platform: {
    urls: [
      { url: '/lms/', priority: '0.8', changefreq: 'weekly' },
      { url: '/lms/dashboard/', priority: '0.7', changefreq: 'weekly' },
      { url: '/lms/courses/', priority: '0.7', changefreq: 'weekly' },
      { url: '/lms/progress/', priority: '0.6', changefreq: 'weekly' },
      { url: '/account/', priority: '0.5', changefreq: 'monthly' },
      { url: '/employers/', priority: '0.7', changefreq: 'monthly' },
      { url: '/students/', priority: '0.7', changefreq: 'monthly' }
    ]
  }
};

// Generate XML sitemap
function generateSitemap(name, urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq }) => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const filename = path.join(SITEMAPS_DIR, `${name}-sitemap.xml`);
  fs.writeFileSync(filename, xml);
  console.log(`✅ Generated ${name}-sitemap.xml (${urls.length} URLs)`);
  return `${DOMAIN}/sitemaps/${name}-sitemap.xml`;
}

// Generate sitemap index
function generateSitemapIndex(sitemapUrls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  // Write both sitemap.xml and sitemap-index.xml
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-index.xml'), xml);
  console.log(`✅ Generated sitemap index (${sitemapUrls.length} sitemaps)`);
}

// Validate URL accessibility (optional)
async function validateUrl(url) {
  try {
    const response = await axios.head(`${DOMAIN}${url}`, { 
      timeout: 5000,
      validateStatus: (status) => status < 500 // Accept redirects
    });
    return response.status < 400;
  } catch (error) {
    console.warn(`⚠️  URL may be inaccessible: ${url} (${error.message})`);
    return true; // Include anyway - might be dynamic content
  }
}

// Main generation function
async function generateAllSitemaps() {
  console.log('🚀 Starting sitemap generation...');
  
  const sitemapUrls = [];
  let totalUrls = 0;

  // Generate individual sitemaps
  for (const [name, config] of Object.entries(urlConfigs)) {
    const sitemapUrl = generateSitemap(name, config.urls);
    sitemapUrls.push(sitemapUrl);
    totalUrls += config.urls.length;
  }

  // Generate sitemap index
  generateSitemapIndex(sitemapUrls);

  console.log(`\n📊 Generation Summary:`);
  console.log(`   • Total URLs: ${totalUrls}`);
  console.log(`   • Sitemaps: ${sitemapUrls.length}`);
  console.log(`   • Domain: ${DOMAIN}`);
  console.log(`   • Timestamp: ${now}`);
  console.log(`\n🔗 Main sitemap: ${DOMAIN}/sitemap.xml`);
  console.log(`📁 Files saved to: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  generateAllSitemaps().catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

module.exports = { generateAllSitemaps, urlConfigs };