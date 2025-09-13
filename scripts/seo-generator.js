const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const siteBaseUrl = 'https://officialadamrivers.github.io';
const profileImageUrl = `${siteBaseUrl}/profile.jpg`;
const profileImageAlt = 'Adam Rivers, Cybersecurity & AI Developer';
const orgName = 'Hello Security LLC';
const personName = 'Adam Rivers';

const siteDir = './_site';  // Adjust to your built site folder, e.g. ./docs for GitHub Pages

const socialProfiles = [
  'https://www.linkedin.com/in/adam-rivers-abtzpro23',
  'https://www.facebook.com/share/1Z8Zu6Y5ER/',
  'https://github.com/abtzpro',
  'https://github.com/OfficialAdamRivers',
  siteBaseUrl,
  'https://abtzpro.github.io'
];

function updateSEO(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  // Title
  if (!$('title').text().trim()) {
    $('title').text(`${personName} - Cybersecurity & AI Developer`);
  }

  // Canonical
  let relativePath = path.relative(siteDir, filePath).replace(/\\/g, '/');
  if (relativePath === 'index.html') relativePath = '';
  const canonicalUrl = `${siteBaseUrl}/${relativePath}`;
  if ($('link[rel="canonical"]').length) {
    $('link[rel="canonical"]').attr('href', canonicalUrl);
  } else {
    $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
  }

  // Meta tags (description, keywords, author, robots, theme-color)
  const metas = {
    'description': 'Cybersecurity, AI development, penetration testing, red team, blue team, vCISO, and cyber defense expertise by Adam Rivers, CEO of Hello Security LLC.',
    'keywords': 'cybersecurity, AI, penetration testing, vCISO, red team, blue team, network security, data protection, incident response, DevSecOps, quantum computing, cyber risk management',
    'author': `${personName}, ${orgName}`,
    'robots': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    'theme-color': '#317EFB',
    'language': 'English',
    'format-detection': 'telephone=no',
    'referrer': 'strict-origin'
  };
  for (const [name, content] of Object.entries(metas)) {
    if ($(`meta[name="${name}"]`).length) {
      $(`meta[name="${name}"]`).attr('content', content);
    } else {
      $('head').append(`<meta name="${name}" content="${content}">`);
    }
  }

  // Open Graph meta tags
  const ogs = {
    'og:type': 'website',
    'og:title': $('title').text(),
    'og:description': metas.description,
    'og:url': canonicalUrl,
    'og:site_name': orgName,
    'og:locale': 'en_US',
    'og:image': profileImageUrl,
    'og:image:alt': profileImageAlt
  };
  for (const [property, content] of Object.entries(ogs)) {
    if ($(`meta[property="${property}"]`).length) {
      $(`meta[property="${property}"]`).attr('content', content);
    } else {
      $('head').append(`<meta property="${property}" content="${content}">`);
    }
  }

  // Twitter Cards
  const twitters = {
    'twitter:card': 'summary_large_image',
    'twitter:title': $('title').text(),
    'twitter:description': metas.description,
    'twitter:image': profileImageUrl,
    'twitter:image:alt': profileImageAlt,
    'twitter:site': '@AdamRivers',
    'twitter:creator': '@AdamRivers'
  };
  for (const [name, content] of Object.entries(twitters)) {
    if ($(`meta[name="${name}"]`).length) {
      $(`meta[name="${name}"]`).attr('content', content);
    } else {
      $('head').append(`<meta name="${name}" content="${content}">`);
    }
  }

  // rel=me social profile links
  socialProfiles.forEach(url => {
    if (!$(`link[rel="me"][href="${url}"]`).length) {
      $('head').append(`<link rel="me" href="${url}">`);
    }
  });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "url": siteBaseUrl,
        "name": `${personName} - Cybersecurity & AI Developer`,
        "publisher": {
          "@id": `${siteBaseUrl}/#organization`
        }
      },
      {
        "@type": "Person",
        "@id": `${siteBaseUrl}/#person`,
        "name": personName,
        "affiliation": {
          "@id": `${siteBaseUrl}/#organization`
        },
        "sameAs": socialProfiles
      },
      {
        "@type": "Organization",
        "@id": `${siteBaseUrl}/#organization`,
        "name": orgName,
        "url": siteBaseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": profileImageUrl
        },
        "sameAs": [
          "https://www.linkedin.com/company/hellosec",
          "https://www.facebook.com/share/1Z8Zu6Y5ER/"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteBaseUrl
          }
        ]
      },
      {
        "@type": "Service",
        "serviceType": "Cybersecurity consulting and AI development",
        "provider": {
          "@id": `${siteBaseUrl}/#organization`
        },
        "areaServed": "Global",
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": `${siteBaseUrl}/contact`
        }
      }
    ]
  };

  let scriptTag = $('script[type="application/ld+json"]');
  if (scriptTag.length) {
    scriptTag.text(JSON.stringify(jsonLd));
  } else {
    $('head').append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  }

  // Save updated html
  fs.writeFileSync(filePath, $.html(), 'utf8');
  console.log(`Updated SEO metadata in: ${filePath}`);
}

function processFiles() {
  const files = fs.readdirSync(siteDir);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      updateSEO(path.join(siteDir, file));
    }
  });
}

processFiles();
