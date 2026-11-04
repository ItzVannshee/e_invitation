const fs = require('fs');
const path = require('path');

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = (req, res) => {
    try {
        // 1. Extract guest name from query parameters or URL path
        let guest = req.query.to || req.query.name || req.query.guest || req.query.g || req.query.guestName || '';
        
        let guestClean = '';
        if (guest) {
            try {
                const cleaned = String(guest).replace(/\+/g, ' ');
                guestClean = cleaned.includes('%') ? decodeURIComponent(cleaned) : cleaned;
            } catch (e) {
                guestClean = String(guest).replace(/\+/g, ' ');
            }
            guestClean = guestClean.trim();
        }

        // 2. Build Title: Matches "✨ ពិធីមង្គលការ ស៊ុន វណ្ណស៊ី និង លុយ កាន្និកា ✨ - Welcome [Guest]"
        const baseTitle = "✨ ពិធីមង្គលការ ស៊ុន វណ្ណស៊ី និង លុយ កាន្និកា ✨";
        const pageTitle = guestClean ? `${baseTitle} - Welcome ${guestClean}` : baseTitle;

        // 3. Khmer wedding invitation description
        const defaultDescription = "សូមគោរពអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ នៅថ្ងៃអាទិត្យ ទី១០ ខែមករា ឆ្នាំ ២០២៧";
        const description = guestClean
            ? `សូមគោរពអញ្ជើញ ${guestClean} ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ នៅថ្ងៃអាទិត្យ ទី១០ ខែមករា ឆ្នាំ ២០២៧`
            : defaultDescription;

        // 4. Determine host for absolute Open Graph image URL
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || '';
        const origin = host ? `${proto}://${host}` : '';
        const imageUrl = `${origin}/assets/decorations/banner.jpg`;
        const pageUrl = `${origin}${req.url}`;

        // 5. Read base index.html
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

        // 6. Inject dynamic meta tags
        const safeTitle = escapeAttr(pageTitle);
        const safeDescription = escapeAttr(description);

        html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
        html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="description" content="${safeDescription}">`);
        
        // Open Graph
        html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:title" content="${safeTitle}">`);
        html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:description" content="${safeDescription}">`);
        html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:image" content="${imageUrl}">`);
        html = html.replace(/<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:image:secure_url" content="${imageUrl}">`);
        
        // Twitter Card
        html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="twitter:title" content="${safeTitle}">`);
        html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="twitter:description" content="${safeDescription}">`);
        html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="twitter:image" content="${imageUrl}">`);

        // If og:url exists, update it
        if (html.includes('property="og:url"')) {
            html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:url" content="${pageUrl}">`);
        }

        // 7. Pre-fill guest name into cover card to avoid text flicker
        if (guestClean) {
            html = html.replace(/(<div id="guest-name"[^>]*>)[^<]*(<\/div>)/i, (match, p1, p2) => `${p1}${escapeAttr(guestClean)}${p2}`);
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.status(200).send(html);
    } catch (err) {
        console.error('Error serving dynamic meta preview:', err);
        try {
            const indexPath = path.join(process.cwd(), 'index.html');
            const fallbackHtml = fs.readFileSync(indexPath, 'utf8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(fallbackHtml);
        } catch (e) {
            return res.status(500).send('Internal Server Error');
        }
    }
};
