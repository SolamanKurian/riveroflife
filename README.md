# There Is Still Hope - Reading Experience

A minimal, contemplative reading experience built with Next.js 14, featuring one sentence per screen with gentle crossfade animations and ambient audio.

## Features

- **Peaceful Reading Flow**: One sentence per full-screen view
- **Gentle Animations**: Crossfade + subtle scale effects with Framer Motion
- **Multiple Navigation**: Mouse wheel, trackpad, keyboard arrows, touch swipe
- **Ambient Audio**: Optional low-volume background audio (user consent only)
- **Responsive Design**: Optimized for all devices with Tailwind CSS
- **Accessibility**: Respects `prefers-reduced-motion`, high contrast, semantic HTML
- **PWA Ready**: Static export friendly with manifest and service worker support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build**: Static export ready
- **Deployment**: Vercel, Netlify, or any static hosting

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd riverlife-reading
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Static export (optional):**
   ```bash
   npm run export
   ```

## Navigation

- **Mouse/Trackpad**: Scroll wheel up/down
- **Keyboard**: Arrow keys (↑/↓) or Page Up/Down
- **Touch**: Swipe left/right on mobile devices
- **Progress**: Visual indicator at bottom with dot progress

## Customization

### Content
Edit `data/tract.ts` to modify the sentences and their order.

### Styling
- Colors: Modify `tailwind.config.js` custom color palette
- Animations: Adjust timing in `app/page.tsx` motion components
- Typography: Update font families in `tailwind.config.js`

### Audio
- Toggle ambient audio on/off
- User preference saved in localStorage
- Very low volume (2% gain) for subtle background

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Deploy automatically on push

### Static Export
1. Run `npm run export`
2. Upload `out/` folder to any static hosting
3. Update `robots.txt` and `sitemap.xml` with your domain

### Environment Variables
No environment variables required for basic functionality.

## Performance

- **Lazy Loading**: Audio context only initialized when enabled
- **Optimized Animations**: Respects user motion preferences
- **Minimal Bundle**: Only essential dependencies included
- **Static Generation**: Pre-built HTML for fast loading

## Accessibility

- **Motion Sensitivity**: Respects `prefers-reduced-motion`
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML and ARIA labels
- **High Contrast**: Optimized text contrast ratios
- **Focus Management**: Clear focus indicators

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Graceful degradation for older browsers

## License

This project is for personal/ministry use. Please respect the content and message.

## Support

For technical issues or questions about the content:
- Email: eldokurian@gmail.com
- Content: Contact the author for permission to modify or distribute

---

*"There is hope. There is love. There is a way forward."*


