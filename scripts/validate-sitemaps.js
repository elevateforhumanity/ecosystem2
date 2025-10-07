#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

// Validation configuration
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_SITEMAP_SIZE = 50 * 1024 * 1024; // 50MB
const REQUIRED_FIELDS = ['loc', 'lastmod'];

class SitemapValidator {
  constructor(publicDir = path.join(__dirname, '../public')) {
    this.publicDir = publicDir;
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalSitemaps: 0,
      totalUrls: 0,
      totalSize: 0
    };
  }

  // Add error
  addError(message, file = null) {
    this.errors.push({ message, file, type: 'error' });
    console.error(`❌ ${file ? `[${file}] ` : ''}${message}`);
  }

  // Add warning
  addWarning(message, file = null) {
    this.warnings.push({ message, file, type: 'warning' });
    console.warn(`⚠️  ${file ? `[${file}] ` : ''}${message}`);
  }

  // Validate XML structure
  async validateXmlStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parser = new xml2js.Parser();
      await parser.parseStringPromise(content);
      return true;
    } catch (error) {
      this.addError(`Invalid XML structure: ${error.message}`, path.basename(filePath));
      return false;
    }
  }

  // Validate sitemap content
  async validateSitemapContent(filePath) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser();

    try {
      const result = await parser.parseStringPromise(content);
      
      // Check if it's a sitemap index or urlset
      if (result.sitemapindex) {
        return this.validateSitemapIndex(result.sitemapindex, fileName);
      } else if (result.urlset) {
        return this.validateUrlset(result.urlset, fileName);
      } else {
        this.addError('Unknown sitemap format', fileName);
        return false;
      }
    } catch (error) {
      this.addError(`Parse error: ${error.message}`, fileName);
      return false;
    }
  }

  // Validate sitemap index
  validateSitemapIndex(sitemapindex, fileName) {
    const sitemaps = sitemapindex.sitemap || [];
    
    if (sitemaps.length === 0) {
      this.addError('Sitemap index contains no sitemaps', fileName);
      return false;
    }

    if (sitemaps.length > 50000) {
      this.addError(`Too many sitemaps: ${sitemaps.length} (max: 50000)`, fileName);
      return false;
    }

    // Validate each sitemap entry
    sitemaps.forEach((sitemap, index) => {
      if (!sitemap.loc || !sitemap.loc[0]) {
        this.addError(`Sitemap ${index + 1} missing location`, fileName);
      }
      
      if (!sitemap.lastmod || !sitemap.lastmod[0]) {
        this.addWarning(`Sitemap ${index + 1} missing lastmod`, fileName);
      }
    });

    this.stats.totalSitemaps += sitemaps.length;
    return true;
  }

  // Validate URL set
  validateUrlset(urlset, fileName) {
    const urls = urlset.url || [];
    
    if (urls.length === 0) {
      this.addWarning('Sitemap contains no URLs', fileName);
      return true;
    }

    if (urls.length > MAX_URLS_PER_SITEMAP) {
      this.addError(`Too many URLs: ${urls.length} (max: ${MAX_URLS_PER_SITEMAP})`, fileName);
      return false;
    }

    // Validate each URL
    const seenUrls = new Set();
    urls.forEach((url, index) => {
      const loc = url.loc && url.loc[0];
      
      if (!loc) {
        this.addError(`URL ${index + 1} missing location`, fileName);
        return;
      }

      // Check for duplicates
      if (seenUrls.has(loc)) {
        this.addError(`Duplicate URL: ${loc}`, fileName);
      }
      seenUrls.add(loc);

      // Validate URL format
      try {
        new URL(loc);
      } catch {
        this.addError(`Invalid URL format: ${loc}`, fileName);
      }

      // Check required fields
      if (!url.lastmod || !url.lastmod[0]) {
        this.addWarning(`URL missing lastmod: ${loc}`, fileName);
      }

      // Validate priority
      if (url.priority && url.priority[0]) {
        const priority = parseFloat(url.priority[0]);
        if (isNaN(priority) || priority < 0 || priority > 1) {
          this.addWarning(`Invalid priority: ${url.priority[0]} for ${loc}`, fileName);
        }
      }

      // Validate changefreq
      if (url.changefreq && url.changefreq[0]) {
        const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        if (!validFreqs.includes(url.changefreq[0])) {
          this.addWarning(`Invalid changefreq: ${url.changefreq[0]} for ${loc}`, fileName);
        }
      }
    });

    this.stats.totalUrls += urls.length;
    return true;
  }

  // Validate file size
  validateFileSize(filePath) {
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    
    if (stats.size > MAX_SITEMAP_SIZE) {
      this.addError(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: 50MB)`, fileName);
      return false;
    }

    this.stats.totalSize += stats.size;
    return true;
  }

  // Test URL accessibility (sample)
  async testUrlAccessibility(sampleSize = 5) {
    console.log(`🔍 Testing URL accessibility (sample of ${sampleSize})...`);
    
    const sitemapFiles = fs.readdirSync(path.join(this.publicDir, 'sitemaps'))
      .filter(file => file.endsWith('.xml'));

    for (const file of sitemapFiles.slice(0, 1)) { // Test first sitemap only
      const filePath = path.join(this.publicDir, 'sitemaps', file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(content);
        
        if (result.urlset && result.urlset.url) {
          const urls = result.urlset.url.slice(0, sampleSize);
          
          for (const url of urls) {
            const loc = url.loc[0];
            try {
              const response = await axios.head(loc, { 
                timeout: 5000,
                validateStatus: (status) => status < 500
              });
              
              if (response.status >= 400) {
                this.addWarning(`URL returns ${response.status}: ${loc}`, file);
              }
            } catch (error) {
              this.addWarning(`URL inaccessible: ${loc} (${error.message})`, file);
            }
          }
        }
      } catch (error) {
        // Skip if can't parse
      }
    }
  }

  // Run all validations
  async validateAll() {
    console.log('🔍 Starting sitemap validation...');
    
    // Find all XML files
    const xmlFiles = [];
    
    // Main sitemap files
    ['sitemap.xml', 'sitemap-index.xml'].forEach(file => {
      const filePath = path.join(this.publicDir, file);
      if (fs.existsSync(filePath)) {
        xmlFiles.push(filePath);
      }
    });

    // Sitemap directory files
    const sitemapsDir = path.join(this.publicDir, 'sitemaps');
    if (fs.existsSync(sitemapsDir)) {
      fs.readdirSync(sitemapsDir)
        .filter(file => file.endsWith('.xml'))
        .forEach(file => {
          xmlFiles.push(path.join(sitemapsDir, file));
        });
    }

    if (xmlFiles.length === 0) {
      this.addError('No XML sitemap files found');
      return false;
    }

    // Validate each file
    for (const filePath of xmlFiles) {
      console.log(`📄 Validating ${path.basename(filePath)}...`);
      
      // File size validation
      this.validateFileSize(filePath);
      
      // XML structure validation
      const isValidXml = await this.validateXmlStructure(filePath);
      
      // Content validation
      if (isValidXml) {
        await this.validateSitemapContent(filePath);
      }
    }

    // Test sample URLs
    await this.testUrlAccessibility();

    return this.errors.length === 0;
  }

  // Generate validation report
  generateReport() {
    console.log('\n📊 Validation Report:');
    console.log(`   • Total sitemaps: ${this.stats.totalSitemaps}`);
    console.log(`   • Total URLs: ${this.stats.totalUrls}`);
    console.log(`   • Total size: ${(this.stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   • Errors: ${this.errors.length}`);
    console.log(`   • Warnings: ${this.warnings.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`   • ${error.file ? `[${error.file}] ` : ''}${error.message}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`   • ${warning.file ? `[${warning.file}] ` : ''}${warning.message}`);
      });
    }

    const isValid = this.errors.length === 0;
    console.log(`\n${isValid ? '✅' : '❌'} Validation ${isValid ? 'passed' : 'failed'}`);
    
    return isValid;
  }
}

// CLI usage
if (require.main === module) {
  const validator = new SitemapValidator();
  
  validator.validateAll()
    .then(() => {
      const isValid = validator.generateReport();
      process.exit(isValid ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { SitemapValidator };