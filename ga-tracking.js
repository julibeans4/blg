// Google Analytics 4 Enhanced Tracking Configuration
// Track page views, events, scroll depth, and user engagement

// Enhanced GA4 initialization
window.dataLayer = window.dataLayer || [];

function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-S96TWWLMC3', {
  'page_path': window.location.pathname,
  'page_title': document.title,
  'allow_google_signals': true,
  'allow_ad_personalization_signals': true,
  'send_page_view': true
});

// Track scroll depth
let maxScroll = 0;
let scrollDepthTracked = {
  25: false,
  50: false,
  75: false,
  100: false
};

window.addEventListener('scroll', function() {
  let scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  maxScroll = Math.max(maxScroll, scrollPercentage);
  
  // Track scroll milestones
  [25, 50, 75, 100].forEach(milestone => {
    if (maxScroll >= milestone && !scrollDepthTracked[milestone]) {
      scrollDepthTracked[milestone] = true;
      gtag('event', 'scroll_depth', {
        'scroll_percentage': milestone
      });
    }
  });
});

// Track time on page
let timeOnPageStart = Date.now();
window.addEventListener('beforeunload', function() {
  let timeOnPage = Math.round((Date.now() - timeOnPageStart) / 1000);
  gtag('event', 'page_engagement', {
    'time_on_page_seconds': timeOnPage,
    'page_location': window.location.href
  });
});

// Track link clicks
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.href) {
    gtag('event', 'link_click', {
      'link_url': e.target.href,
      'link_text': e.target.innerText,
      'link_target': e.target.target || '_self'
    });
  }
});

// Track card clicks (navigation)
document.addEventListener('click', function(e) {
  const card = e.target.closest('.card');
  if (card && card.href) {
    gtag('event', 'card_click', {
      'card_title': card.querySelector('h3')?.innerText || 'Unknown',
      'card_url': card.href
    });
  }
});

// Set user properties for demographics
gtag('set', {
  'user_properties': {
    'interests': 'art,design,creative,music'
  }
});

// Track custom user engagement events
window.addEventListener('load', function() {
  gtag('event', 'page_fully_loaded', {
    'page_title': document.title,
    'page_path': window.location.pathname
  });
});

// Track outbound links differently
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href && link.href.includes('http') && !link.href.includes(window.location.hostname)) {
    gtag('event', 'outbound_link_click', {
      'outbound_url': link.href,
      'link_text': link.innerText
    });
  }
});
