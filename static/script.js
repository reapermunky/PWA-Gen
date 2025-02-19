document.getElementById('generate').addEventListener('click', async () => {
    const requestText = document.getElementById('userRequest').value;
    if (!requestText) {
        alert('Please enter a description for the PWA or select a template.');
        return;
    }

    let generatedHTML, generatedCSS, generatedJS;

    // Check if user selected a template
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (selectedTemplate) {
        const response = await fetch('/Metapwa/static/templates.json');
        const templates = await response.json();
        const template = templates.templates[selectedTemplate];
        if (template) {
            generatedHTML = template.html;
            generatedCSS = `<style>${template.css}</style>`;
            generatedJS = `<script>${template.js}</script>`;
        }
    } else {
        // Call OpenAI API if no template is selected
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_OPENAI_API_KEY', // Replace with actual API key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'Generate a complete PWA based on the user request. Include HTML, CSS, and JavaScript as separate code blocks. Make sure the JavaScript does not contain syntax errors.' },
                    { role: 'user', content: requestText }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            alert('Failed to generate PWA. Please try again.');
            return;
        }

        const data = await response.json();

        generatedHTML = data.choices[0].message.content.match(/<html>.*<\/html>/s)?.[0] || "<h1>Error: No valid HTML received.</h1>";
        generatedCSS = data.choices[0].message.content.match(/<style>.*<\/style>/s)?.[0] || "";
        generatedJS = data.choices[0].message.content.match(/<script>.*<\/script>/s)?.[0] || "";
    }

    // Apply selected theme
    const selectedTheme = document.getElementById('themeSelect').value;
    if (selectedTheme === "dark") {
        generatedCSS += `<style>body { background-color: #1e1e1e; color: #ffffff; }</style>`;
    } else if (selectedTheme === "light") {
        generatedCSS += `<style>body { background-color: #ffffff; color: #000000; }</style>`;
    }

    // Debugging: Check for common syntax errors before rendering
    try {
        new Function(generatedJS.replace(/<script>|<\/script>/g, '')); // Check JS syntax without execution
    } catch (error) {
        alert('Error in generated JavaScript: ' + error.message);
        return;
    }

    // Create full PWA preview with extracted content
    const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Generated PWA</title>
            ${generatedCSS}
        </head>
        <body>
            ${generatedHTML}
            ${generatedJS}
        </body>
        </html>`;

    // Inject into iframe for live preview
    const previewFrame = document.getElementById('preview');
    const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write(fullHTML);
    doc.close();
});

// Dark mode toggle
document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Load templates into dropdown menu
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('static/templates.json');
    const templates = await response.json();
    const select = document.getElementById('templateSelect');
    for (const key in templates.templates) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = templates.templates[key].name;
        select.appendChild(option);
    }
});
