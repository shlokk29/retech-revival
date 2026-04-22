const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const emojiMap = {
  '♻️': '<i data-lucide="recycle"></i>',
  '🛒': '<i data-lucide="shopping-cart"></i>',
  '🌱': '<i data-lucide="leaf"></i>',
  '💻': '<i data-lucide="laptop"></i>',
  '💰': '<i data-lucide="circle-dollar-sign"></i>',
  '🛍️': '<i data-lucide="shopping-bag"></i>',
  '✨': '<i data-lucide="sparkles"></i>',
  '🔬': '<i data-lucide="microscope"></i>',
  '🛡️': '<i data-lucide="shield-check"></i>',
  '🚚': '<i data-lucide="truck"></i>',
  '↩️': '<i data-lucide="undo-2"></i>',
  '🔍': '<i data-lucide="search"></i>',
  '🎉': '<i data-lucide="party-popper"></i>',
  '🎊': '<i data-lucide="party-popper"></i>',
  '📅': '<i data-lucide="calendar"></i>',
  '✅': '<i data-lucide="check-circle-2"></i>',
  '🔌': '<i data-lucide="plug"></i>',
  '📦': '<i data-lucide="package"></i>',
  '💼': '<i data-lucide="briefcase"></i>',
  '👨‍💻': '<i data-lucide="user"></i>',
  '👩‍💼': '<i data-lucide="user"></i>',
  '🧑‍🎨': '<i data-lucide="user"></i>',
  '🤝': '<i data-lucide="handshake"></i>',
  '🗑': '<i data-lucide="trash-2"></i>'
};

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Inject Lucide script in head if not present
      if (!content.includes('lucide@latest')) {
        content = content.replace(
          '</head>',
          '  <script src="https://unpkg.com/lucide@latest"></script>\n</head>'
        );
      }
      
      // Inject lucide.createIcons() before body end if not present
      if (!content.includes('lucide.createIcons()')) {
        content = content.replace(
          '</body>',
          '  <script>lucide.createIcons();</script>\n</body>'
        );
      }
      
      // Replace emojis
      for (const [emoji, icon] of Object.entries(emojiMap)) {
        // use regex to replace globally
        const regex = new RegExp(emoji, 'g');
        content = content.replace(regex, icon);
      }

      // Add a couple of other CSS adjustments for icons
      if (content.includes('<style>') && !content.includes('.lucide {')) {
         content = content.replace('<style>', '<style>\n    .lucide { width: 1em; height: 1em; vertical-align: middle; }');
      }
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

processFiles(publicDir);
console.log('Done mapping emojis to Lucide icons.');
