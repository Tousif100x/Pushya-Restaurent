const fs = require('fs');
const path = require('path');

const menuFile = path.join(__dirname, 'src', 'data', 'menu.ts');

let content = fs.readFileSync(menuFile, 'utf8');

// Replace any occurrence of price: XX0, with price: XX9
// For example, price: 60 -> price: 59
// price: 100 -> price: 99
// Regex explanation: look for "price: " followed by digits ending in 0.
content = content.replace(/price:\s*(\d+)0\b/g, (match, p1) => {
    // p1 is the number before the 0. So if 60, p1 is '6'. If 100, p1 is '10'.
    // The number is p1 + '0', so we subtract 1.
    const num = parseInt(p1 + '0');
    return `price: ${num - 1}`;
});

fs.writeFileSync(menuFile, content, 'utf8');
console.log('Prices updated successfully!');
