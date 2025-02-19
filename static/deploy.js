document.getElementById('deploy').addEventListener('click', async () => {
    const requestText = document.getElementById('userRequest').value;
    if (!requestText) {
        alert('Please enter a description for the PWA.');
        return;
    }

    // Simulate creating a GitHub Pages-ready repository structure
    const repoName = `pwa-${Date.now()}`;
    const zipFileName = `${repoName}.zip`;

    // Creating a zip file for download
    const zip = new JSZip();
    zip.file('index.html', document.getElementById('preview').contentDocument.documentElement.outerHTML);
    zip.file('manifest.json', `{
        "name": "${repoName}",
        "short_name": "${repoName}",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "icons": [
            {
                "src": "icon.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "icon.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }`);
    zip.file('service-worker.js', `self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open('${repoName}-cache').then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/manifest.json',
                    '/service-worker.js'
                ]);
            })
        );
    });
    
    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    });`);

    const content = await zip.generateAsync({ type: 'blob' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = zipFileName;
    downloadLink.click();

    alert('Your PWA is ready for deployment! Upload this zip file to GitHub or Vercel to go live.');
});
