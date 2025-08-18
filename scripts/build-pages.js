const fs = require('fs');
const path = require('path');

// This script pre-generates all pages at build time
// to eliminate runtime loading and improve performance

const TRACT_PAGES = [
  { id: 0, text: "Your life is precious to Him.", type: 'title', backgroundImage: '/one.svg' },
  { id: 1, text: "No matter your past, God still loves you.", type: 'content', backgroundImage: '/two.svg' },
  { id: 2, text: "His love isn't based on status or background.", type: 'content', backgroundImage: '/three.svg' },
  { id: 3, text: "No sin is too great for His forgiveness; no heart too broken for His healing.", type: 'content', backgroundImage: '/four.svg' },
  { id: 4, text: "Jesus Christ gave His life so you could be forgiven.", type: 'content', backgroundImage: '/five.svg' },
  { id: 5, text: "Jesus is alive—the image of the invisible God.", type: 'content', backgroundImage: '/six.svg' },
  { id: 6, text: "He came to bear the punishments for all sin so we could go free.", type: 'content', backgroundImage: '/seven.svg' },
  { id: 7, text: "Open your heart and believe: His death was for your sins, and He was raised from the dead.", type: 'content', backgroundImage: '/eight.svg' },
  { id: 8, text: "You will find the freedom God promised.", type: 'content', backgroundImage: '/nine.svg' },
  { id: 9, text: "Loving Jesus leads to true happiness and peace.", type: 'content', backgroundImage: '/ten.svg' },
  { id: 10, text: "He came to save you from sin you could not escape yourself.", type: 'content', backgroundImage: '/eleven.svg' },
  { id: 11, text: "This isn't about religion or rituals—it's about salvation and freedom.", type: 'content', backgroundImage: '/twelve.svg' },
  { id: 12, text: "In a selfish world, Jesus calls you to grace and truth.", type: 'content', backgroundImage: '/thirteen.svg' },
  { id: 13, text: "You don't need money or rituals—just an open heart.", type: 'content', backgroundImage: '/fourteen.svg' },
  { id: 14, text: "Admit your sins to Jesus; He will forgive you and give you new life.", type: 'content', backgroundImage: '/fifteen.svg' },
  { id: 15, text: "He will free you from what kept you in bondage.", type: 'content', backgroundImage: '/sixteen.svg' },
  { id: 16, text: "A simple prayer for a new start:", type: 'content', backgroundImage: '/seventeen.svg' },
  { id: 17, text: "Merciful Jesus, You love me. Please forgive my sins.", type: 'prayer', backgroundImage: '/eighteen.svg' },
  { id: 18, text: "I believe You died in my place to free me from punishment and guilt.", type: 'prayer', backgroundImage: '/eighteen.svg' },
  { id: 19, text: "I give You my burdens—my pain, sins, and worries.", type: 'prayer', backgroundImage: '/nineteen.svg' },
  { id: 20, text: "Fill my heart with peace and joy. Be my light in the darkness.", type: 'prayer', backgroundImage: '/twenty.svg' },
  { id: 21, text: "Jesus said He will never reject anyone who comes to Him—and never leave them.", type: 'prayer', backgroundImage: '/twentyone.svg' },
  { id: 22, text: "If you prayed, He has heard you. You are forgiven and beginning a new life.", type: 'prayer', backgroundImage: '/twentytwo.svg' },
  { id: 23, text: "Keep seeking Him; you will find true joy and abundant life in Jesus.", type: 'prayer', backgroundImage: '/twentythree.svg' },
  { id: 24, text: "Want help continuing this new way of life?", type: 'content', backgroundImage: '/twentyfour.svg' },
  { id: 25, text: "Email: eldokurian@gmail.com", type: 'contact', backgroundImage: '/twentyfive.svg' },
  { id: 26, text: "May God bless you on this journey of hope and love.", type: 'content', backgroundImage: '/twentysix.svg' }
];

function generatePageData() {
  const outputPath = path.join(__dirname, '../app/generated-pages.json');
  
  const pageData = TRACT_PAGES.map(page => ({
    ...page,
    // Pre-compute styling based on page type
    styling: getPageStyling(page),
    // Pre-compute highlight words
    highlightWords: getHighlightWords(page),
    // Pre-compute animations
    animations: getPageAnimations(page)
  }));
  
  fs.writeFileSync(outputPath, JSON.stringify(pageData, null, 2));
  console.log(`✅ Generated ${pageData.length} pages at build time`);
}

function getPageStyling(page) {
  switch (page.type) {
    case 'title':
      return {
        fontSize: 'text-7xl md:text-8xl lg:text-9xl',
        textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6), 0 0 90px rgba(0,0,0,0.4)',
        highlightColor: 'text-yellow-300'
      };
    case 'prayer':
      return {
        fontSize: 'text-6xl md:text-7xl lg:text-8xl',
        textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
      };
    case 'contact':
      return {
        fontSize: 'text-2xl md:text-3xl',
        textShadow: 'none'
      };
    default:
      return {
        fontSize: 'text-6xl md:text-7xl lg:text-8xl',
        textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
      };
  }
}

function getHighlightWords(page) {
  if (page.id === 0) return ['Hope'];
  if (page.id === 2) return ['hope'];
  if (page.id === 3 || page.id === 4) return ['?'];
  return [];
}

function getPageAnimations(page) {
  if (page.id === 0) {
    return {
      title: {
        scale: [1, 1.1, 1],
        duration: 2,
        repeat: Infinity
      }
    };
  }
  
  if (page.id === 2) {
    return {
      highlight: {
        scale: [1, 1.1, 1],
        duration: 4,
        repeat: Infinity
      }
    };
  }
  
  if (page.id === 3 || page.id === 4) {
    return {
      questionMark: {
        scale: [1, 1.4, 1],
        duration: 3,
        repeat: Infinity
      }
    };
  }
  
  return {};
}

// Run the generation
generatePageData();

