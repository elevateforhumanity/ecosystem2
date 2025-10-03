#!/usr/bin/env node
/**
 * Autopilot Wix DNS Pointing
 * Monitors and validates DNS configuration for Wix integration
 */

const dns = require('dns').promises;

const DOMAINS = [
  'elevateforhumanity.org',
  'www.elevateforhumanity.org',
  'elevateconnectsdirectory.org',
  'selfishinc.org',
  'riseforwardfoundation.org'
];

async function checkDNS(domain) {
  try {
    const addresses = await dns.resolve4(domain);
    console.log(`   ✅ ${domain}: ${addresses.join(', ')}`);
    return true;
  } catch (error) {
    console.log(`   ❌ ${domain}: ${error.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.some(arg => arg.startsWith('--watch'));
  const watchInterval = watchMode ? parseInt(args.find(arg => arg.startsWith('--watch'))?.split('=')[1] || '300') : null;
  
  async function runCheck() {
    console.log('🌐 Checking DNS configuration...\n');
    
    let allValid = true;
    for (const domain of DOMAINS) {
      const valid = await checkDNS(domain);
      if (!valid) allValid = false;
    }
    
    console.log('');
    if (allValid) {
      console.log('✨ All DNS records are configured correctly!');
    } else {
      console.log('⚠️  Some DNS records need attention');
    }
    
    return allValid;
  }
  
  if (watchMode) {
    console.log(`🔄 Watch mode enabled (checking every ${watchInterval}s)\n`);
    
    while (true) {
      await runCheck();
      console.log(`\n⏰ Next check in ${watchInterval}s...\n`);
      await new Promise(resolve => setTimeout(resolve, watchInterval * 1000));
    }
  } else {
    const result = await runCheck();
    process.exit(result ? 0 : 1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
