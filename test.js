const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<article class="case-study-content" id="tabContentSafemap">([\s\S]*?)<\/article>/;
const match = html.match(regex);
if (match) {
    console.log("SafeMap article length:", match[1].length);
    console.log("Number of <div class=\"lang-vi\">:", (match[1].match(/<div class="lang-vi">/g) || []).length);
    console.log("Number of <div class=\"lang-en\">:", (match[1].match(/<div class="lang-en">/g) || []).length);
} else {
    console.log("Not found!");
}
