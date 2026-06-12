import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function exportPortfolioToZip(portfolioData: any) {
  const zip = new JSZip();

  // Create basic HTML structure
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioData.seo?.title || 'My Portfolio'}</title>
  <meta name="description" content="${portfolioData.seo?.description || ''}">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '${portfolioData.themeColor || '#6366f1'}',
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
    }
    .radius-custom {
      border-radius: ${portfolioData.themeRadius || '0.5rem'};
    }
  </style>
</head>
<body class="${portfolioData.themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} antialiased">
  <main class="max-w-5xl mx-auto py-12 px-8 flex flex-col gap-6">
`;

  // Generate HTML for each block
  portfolioData.blocks?.forEach((block: any) => {
    htmlContent += `    <!-- Block: ${block.type} -->\n`;
    
    switch (block.type) {
      case 'heading':
        htmlContent += `    <h1 class="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-current to-gray-500 mb-8">${block.content?.text || ''}</h1>\n`;
        break;
        
      case 'bio':
        htmlContent += `    <div class="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden mb-8 radius-custom">
      ${block.content?.imageUrl ? `<div class="w-32 h-32 rounded-full shrink-0 overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-900 z-10"><img src="${block.content.imageUrl}" alt="Profile" class="w-full h-full object-cover" /></div>` : ''}
      <div class="space-y-3 z-10 text-center md:text-left">
        <h2 class="text-3xl font-bold tracking-tight">${block.content?.name || ''}</h2>
        <p class="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">${block.content?.description || ''}</p>
      </div>
    </div>\n`;
        break;
        
      case 'experience':
        htmlContent += `    <div class="space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 radius-custom">
      <div class="flex gap-6">
        ${block.content?.logoUrl ? `<div class="w-16 h-16 rounded-xl shrink-0"><img src="${block.content.logoUrl}" alt="Logo" class="w-full h-full object-cover rounded-xl" /></div>` : ''}
        <div class="flex-1">
          <h4 class="text-xl font-bold">${block.content?.title || ''}</h4>
          <div class="flex items-center gap-2 text-primary font-medium mt-1">
            <span>${block.content?.company || ''}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-500">${block.content?.period || ''}</span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mt-4 leading-relaxed whitespace-pre-wrap">${block.content?.description || ''}</p>
        </div>
      </div>
    </div>\n`;
        break;
        
      case 'gallery':
        htmlContent += `    <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      ${(block.content?.images || []).map((img: string) => img ? `<div class="aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-md radius-custom"><img src="${img}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>` : '').join('\n      ')}
    </div>\n`;
        break;
        
      case 'projects':
        htmlContent += `    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      ${(block.content?.items || []).map((p: any) => `<div class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm radius-custom">
        <h4 class="font-bold text-xl">${p.name || ''}</h4>
        <p class="text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">${p.desc || ''}</p>
        ${p.link ? `<a href="${p.link}" class="text-primary font-medium text-sm mt-6 inline-block hover:underline" target="_blank">View Project &rarr;</a>` : ''}
      </div>`).join('\n      ')}
    </div>\n`;
        break;
        
      case 'skills':
        htmlContent += `    <div class="flex flex-wrap gap-3 mb-8">
      ${(block.content?.skills || []).map((s: string) => `<span class="px-5 py-2.5 bg-white dark:bg-gray-800 border border-primary text-gray-900 dark:text-white rounded-full text-sm font-medium shadow-sm">${s}</span>`).join('\n      ')}
    </div>\n`;
        break;
        
      case 'social':
        htmlContent += `    <div class="flex justify-center gap-4 py-8 border-t border-gray-200 dark:border-gray-800 mt-8">
      ${(block.content?.links || []).map((link: any) => `<a href="${link.url}" class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full hover:opacity-90 transition-opacity" target="_blank">${link.platform}</a>`).join('\n      ')}
    </div>\n`;
        break;

      case 'education':
        htmlContent += `    <div class="space-y-6 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 radius-custom">
      <h3 class="text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4">Education</h3>
      <div class="space-y-6">
        ${(block.content?.items || []).map((item: any) => `
        <div class="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full before:ring-4 before:ring-primary/20">
          <h4 class="text-xl font-bold">${item.school || ''}</h4>
          <div class="flex items-center gap-2 text-primary font-medium mt-1">
            <span>${item.degree || ''}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-500">${item.period || ''}</span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mt-3 leading-relaxed whitespace-pre-wrap">${item.description || ''}</p>
        </div>`).join('\n        ')}
      </div>
    </div>\n`;
        break;

      case 'pricing':
        htmlContent += `    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      ${(block.content?.items || []).map((tier: any) => `
      <div class="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col text-center radius-custom">
        <h4 class="font-bold text-xl mb-2">${tier.tier || ''}</h4>
        <div class="text-4xl font-extrabold mb-6 text-primary">${tier.price || ''}</div>
        <ul class="space-y-3 mb-8 flex-1 text-gray-500 dark:text-gray-400 text-left">
          ${(tier.features || []).map((feat: string) => `
          <li class="flex items-start gap-2">
            <svg class="w-4 h-4 text-primary shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>${feat}</span>
          </li>`).join('')}
        </ul>
        <button class="py-3 px-4 bg-primary text-white font-semibold rounded-xl opacity-90 hover:opacity-100 transition-opacity w-full">Get Started</button>
      </div>`).join('\n      ')}
    </div>\n`;
        break;

      case 'faq':
        htmlContent += `    <div class="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm space-y-6 mb-8 radius-custom">
      <h3 class="text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4 text-center">Frequently Asked Questions</h3>
      <div class="space-y-4">
        ${(block.content?.items || []).map((item: any) => `
        <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h4 class="font-bold text-lg mb-2">${item.question || ''}</h4>
          <p class="text-gray-500 dark:text-gray-400 leading-relaxed">${item.answer || ''}</p>
        </div>`).join('\n        ')}
      </div>
    </div>\n`;
        break;
    }
  });

  htmlContent += `  </main>
</body>
</html>`;

  zip.file("index.html", htmlContent);
  zip.file("README.md", `# ${portfolioData.seo?.title || 'My Portfolio'}

This portfolio was generated with GenFolio.
To view it, simply open \`index.html\` in any web browser.

## Customization
The styling is powered by Tailwind CSS via CDN. You can modify the \`tailwind.config\` object in the \`<head>\` of \`index.html\` to change the primary colors or fonts.
`);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "portfolio.zip");
}
