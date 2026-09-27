const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<article class="case-study-content" id="tabContentSafemap">([\s\S]*?)<\/article>/;
const match = html.match(regex);
if (match) {
    const safemapContent = match[1];
    
    // Check if there are any unclosed tags or structural issues
    const viContent = safemapContent.split('<div class="lang-en">')[0];
    const enContent = safemapContent.split('<div class="lang-en">')[1];
    
    console.log("viContent length:", viContent.length);
    console.log("enContent length:", enContent ? enContent.length : "NOT FOUND");
    
    if (viContent.includes('screens-gallery-grid')) {
        console.log("VI has gallery");
    } else {
        console.log("VI NO GALLERY");
    }
    
    if (enContent && enContent.includes('screens-gallery-grid')) {
        console.log("EN has gallery");
    } else {
        console.log("EN NO GALLERY");
    }
}
