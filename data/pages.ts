export interface PageData {
  id: number
  text: string
  backgroundImage: string
  textSize: 'title' | 'large' | 'medium' | 'small' | 'contact'
  highlightWords?: string[]
  specialStyling?: 'question' | 'highlight' | 'normal'
}

export const PAGES_DATA: PageData[] = [
  {
    id: 0,
    text: "There Is Still Hope.",
    backgroundImage: "/one.svg",
    textSize: "title",
    highlightWords: ["Hope"],
    specialStyling: "highlight"
  },
  {
    id: 1,
    text: "No matter what you've been through, you are not alone.",
    backgroundImage: "/two.svg",
    textSize: "large"
  },
  {
    id: 2,
    text: "There is hope. There is love. There is a way forward.",
    backgroundImage: "/three.svg",
    textSize: "large",
    highlightWords: ["hope", "love"],
    specialStyling: "highlight"
  },
  {
    id: 3,
    text: "Have you ever felt like your dreams are slipping away?",
    backgroundImage: "/four.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 4,
    text: "Do pain and struggle seem to follow you wherever you go?",
    backgroundImage: "/five.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 5,
    text: "Do your plans often remain unfinished?",
    backgroundImage: "/six.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 6,
    text: "Have careful steps turned into your worst choices?",
    backgroundImage: "/seven.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 7,
    text: "Have relationships with family and loved ones grown distant?",
    backgroundImage: "/eight.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 8,
    text: "Are you carrying guilt, regret, and sorrow in silence?",
    backgroundImage: "/nine.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 9,
    text: "If any of these speak to your heart, keep reading. There is hope.",
    backgroundImage: "/ten.svg",
    textSize: "large",
    highlightWords: ["There is hope"],
    specialStyling: "highlight"
  },
  {
    id: 10,
    text: "Did you once believe success or money would bring happiness, yet feel empty?",
    backgroundImage: "/eleven.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 11,
    text: "Has your marriage lost its love?",
    backgroundImage: "/twelve.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 12,
    text: "Have you hurt others while chasing money or pleasure?",
    backgroundImage: "/thirteen.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 13,
    text: "Do you feel trapped, unable to turn back?",
    backgroundImage: "/fourteen.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 14,
    text: "Tired of pretending everything is okay while breaking inside?",
    backgroundImage: "/fifteen.svg",
    textSize: "large",
    specialStyling: "question"
  },
  {
    id: 15,
    text: "You don't have to live in despair. There is a way out.",
    backgroundImage: "/sixteen.svg",
    textSize: "large",
    highlightWords: ["way out"],
    specialStyling: "highlight"
  },
  {
    id: 16,
    text: "No, my friend, not all is lost.",
    backgroundImage: "/seventeen.svg",
    textSize: "large",
    highlightWords: ["not"],
    specialStyling: "highlight"
  },
  {
    id: 17,
    text: "There is hope. Your life isn't meant for pain and regret.",
    backgroundImage: "/ei.svg",
    textSize: "large",
    highlightWords: ["There is hope"],
    specialStyling: "highlight"
  },
  {
    id: 18,
    text: "God loves you and sent Jesus to set you free.",
    backgroundImage: "/nineteen.svg",
    textSize: "large",
    highlightWords: ["God", "Jesus"],
    specialStyling: "highlight"
  },
  {
    id: 19,
    text: "Your life is precious to Him.",
    backgroundImage: "/twenty.svg",
    textSize: "large",
    highlightWords: ["your"],
    specialStyling: "highlight"
  },
  {
    id: 20,
    text: "No matter your past, God still loves you.",
    backgroundImage: "/twentyone.svg",
    textSize: "large",
    highlightWords: ["loves"],
    specialStyling: "highlight"
  },
  {
    id: 21,
    text: "His love isn't based on status or background.",
    backgroundImage: "/twentytwo.svg",
    textSize: "large",
    highlightWords: ["love"],
    specialStyling: "highlight"
  },
  {
    id: 22,
    text: "No sin is too great for His forgiveness; no heart too broken for His healing.",
    backgroundImage: "/twentythree.svg",
    textSize: "large",
    highlightWords: ["No", "no"],
    specialStyling: "highlight"
  },
  {
    id: 23,
    text: "Jesus Christ gave His life so you could be forgiven.",
    backgroundImage: "/twentyfour.svg",
    textSize: "large",
    highlightWords: ["Jesus Christ"],
    specialStyling: "highlight"
  },
  {
    id: 24,
    text: "Jesus is alive—the image of the invisible God.",
    backgroundImage: "/twentyfive.svg",
    textSize: "large",
    highlightWords: ["God"],
    specialStyling: "highlight"
  },
  {
    id: 25,
    text: "He came to bear the punishments for all sin so we could go free.",
    backgroundImage: "/twentysix.svg",
    textSize: "large",
    highlightWords: ["Free"],
    specialStyling: "highlight"
  },
  {
    id: 26,
    text: "Open your heart and believe: His death was for your sins, and He was raised from the dead.",
    backgroundImage: "/twentyseven.svg",
    textSize: "large",
    highlightWords: ["raised"],
    specialStyling: "highlight"
  },
  {
    id: 27,
    text: "You will find the freedom God promised.",
    backgroundImage: "/twentyeight.svg",
    textSize: "large",
    highlightWords: ["freedom"],
    specialStyling: "highlight"
  },
  {
    id: 28,
    text: "Loving Jesus leads to true happiness and peace.",
    backgroundImage: "/twentynine.svg",
    textSize: "large",
    highlightWords: ["Jesus"],
    specialStyling: "highlight"
  },
  {
    id: 29,
    text: "He came to save you from sin you could not escape yourself.",
    backgroundImage: "/thirty.svg",
    textSize: "large",
    highlightWords: ["save"],
    specialStyling: "highlight"
  },
  {
    id: 30,
    text: "This isn't about religion or rituals—it's about salvation and freedom.",
    backgroundImage: "/thirtyone.svg",
    textSize: "large",
    highlightWords: ["salvation", "freedom"],
    specialStyling: "highlight"
  },
  {
    id: 31,
    text: "In a selfish world, Jesus calls you to grace and truth.",
    backgroundImage: "/thirtytwo.svg",
    textSize: "large",
    highlightWords: ["grace", "truth"],
    specialStyling: "highlight"
  },
  {
    id: 32,
    text: "You don't need money or rituals—just an open heart.",
    backgroundImage: "/thirtythree.svg",
    textSize: "large",
    highlightWords: ["don't", "heart"],
    specialStyling: "highlight"
  },
  {
    id: 33,
    text: "Admit your sins to Jesus; He will forgive you and give you new life.",
    backgroundImage: "/thirtyfour.svg",
    textSize: "large",
    highlightWords: ["new life"],
    specialStyling: "highlight"
  },
  {
    id: 34,
    text: "He will free you from what kept you in bondage.",
    backgroundImage: "/thirtyfive.svg",
    textSize: "large",
    highlightWords: ["free"],
    specialStyling: "highlight"
  },
  {
    id: 35,
    text: "A simple prayer for a new start:",
    backgroundImage: "/thirtysix.svg",
    textSize: "large",
    highlightWords: ["prayer"],
    specialStyling: "highlight"
  },
  {
    id: 36,
    text: "Merciful Jesus, You love me. Please forgive my sins.",
    backgroundImage: "/thirtyseven.svg",
    textSize: "large",
    highlightWords: ["Jesus", "forgive"],
    specialStyling: "highlight"
  },
  {
    id: 37,
    text: "I believe You died in my place to free me from punishment and guilt.",
    backgroundImage: "/thirtyseven.svg",
    textSize: "large",
    highlightWords: ["died", "place"],
    specialStyling: "highlight"
  },
  {
    id: 38,
    text: "I give You my burdens—my pain, sins, and worries.",
    backgroundImage: "/thirtyseven.svg",
    textSize: "large",
    highlightWords: ["burdens", "worries"],
    specialStyling: "highlight"
  },
  {
    id: 39,
    text: "Fill my heart with peace and joy. Be my light in the darkness.",
    backgroundImage: "/thirtyseven.svg",
    textSize: "large",
    highlightWords: ["peace", "joy"],
    specialStyling: "highlight"
  },
  {
    id: 40,
    text: "Jesus said He will never reject anyone who comes to Him—and never leave them.",
    backgroundImage: "/fourtyone.svg",
    textSize: "large",
    highlightWords: ["never", "never"],
    specialStyling: "highlight"
  },
  {
    id: 41,
    text: "If you prayed, He has heard you. You are forgiven and beginning a new life.",
    backgroundImage: "/fourtytwo.svg",
    textSize: "large",
    highlightWords: ["new life"],
    specialStyling: "highlight"
  },
  {
    id: 42,
    text: "Keep seeking Him; you will find true joy and abundant life in Jesus.",
    backgroundImage: "/fourtythree.svg",
    textSize: "large",
    highlightWords: ["keep seeking", "jesus"],
    specialStyling: "highlight"
  },
  {
    id: 43,
    text: "Want help continuing this new way of life?",
    backgroundImage: "/fourtyfour.svg",
    textSize: "large",
    highlightWords: ["want help", "?"],
    specialStyling: "question"
  },
  {
    id: 44,
    text: "Email: eldokurian@gmail.com",
    backgroundImage: "/fourtyfive.svg",
    textSize: "medium",
    highlightWords: ["email"],
    specialStyling: "highlight"
  },
  {
    id: 45,
    text: "May God bless you on this journey of hope and love.",
    backgroundImage: "/fourtysix.svg",
    textSize: "large",
    highlightWords: ["god", "hope", "love"],
    specialStyling: "highlight"
  }
];

export const getPageData = (id: number): PageData | undefined => {
  return PAGES_DATA.find(page => page.id === id);
};

export const getNextPageData = (currentId: number): PageData | undefined => {
  return PAGES_DATA.find(page => page.id === currentId + 1);
};

export const getPreviousPageData = (currentId: number): PageData | undefined => {
  return PAGES_DATA.find(page => page.id === currentId - 1);
};
