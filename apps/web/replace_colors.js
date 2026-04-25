const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/esports-platform-local-rummy/esports-platform/apps/web/src');
files.forEach(file => {
    if (file.includes('globals.css') || file.includes('tailwind.config.ts')) return;
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;
    content = content.replace(/\bbg-gray-950\b/g, 'bg-background');
    content = content.replace(/\bbg-gray-900\b/g, 'bg-card');
    content = content.replace(/\bbg-gray-[78]00\b/g, 'bg-muted');
    content = content.replace(/\bborder-gray-[78]00\b/g, 'border-border');
    content = content.replace(/\btext-gray-[45]00\b/g, 'text-muted-foreground');
    content = content.replace(/\bbg-purple-[56]00\b/g, 'bg-primary text-primary-foreground');
    content = content.replace(/\bhover:bg-purple-[67]00\b/g, 'hover:bg-primary/90');
    content = content.replace(/\btext-purple-[45]00\b/g, 'text-primary');
    content = content.replace(/\bfocus:ring-purple-500\b/g, 'focus:ring-ring');
    content = content.replace(/\bborder-purple-[45]00\b/g, 'border-primary');
    content = content.replace(/\bfrom-purple-[4569]00\b/g, 'from-primary');
    content = content.replace(/\bto-pink-[679]00\b/g, 'to-primary/60');

    if (content !== original) {
        fs.writeFileSync(file, content);
    }
});
console.log('Colors replaced successfully!');
