const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('C:/xampp/htdocs/CasaGest/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace getImageUrl from page.tsx (it uses a local function)
    if (filePath.includes('page.tsx') && content.includes('const getImageUrl')) {
      content = content.replace(/const getImageUrl = \(imovel: Imovel\) => \{[\s\S]*?return \`\$\{baseUrl\}\/storage\/\$\{imovel\.imagens\[0\]\.caminho\}\`;\n    \}\n    \/\/ High-res Unsplash fallback\n    return 'https:\/\/images\.unsplash\.com\/photo-1580587771525-78b9dba3b914\?auto=format&fit=crop&w=800&q=80';\n  \};/g, '');
    }

    // Replace getImageUrl calls
    content = content.replace(/getImageUrl\(/g, 'resolveImageUrl(');
    content = content.replace(/imovel\.imagens\[0\]\.caminho/g, 'imovel.imagens?.[0]?.caminho');
    
    // Replace direct url interpolation
    content = content.replace(/`http:\/\/localhost:8000\/storage\/\$\{([^}]+)\}`/g, 'resolveImageUrl($1)');
    content = content.replace(/`http:\/\/127\.0\.0\.1:8000\/storage\/\$\{([^}]+)\}`/g, 'resolveImageUrl($1)');

    if (content !== originalContent) {
      if (!content.includes('resolveImageUrl(')) return; // If we didn't actually add the call
      
      if (!content.includes('import { resolveImageUrl }')) {
        const importStatement = `import { resolveImageUrl } from '@/lib/utils';\n`;
        content = importStatement + content;
      }
      fs.writeFileSync(filePath, content);
      console.log('Updated: ' + filePath);
    }
  }
});
