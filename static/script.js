document.getElementById('generate').addEventListener('click', async () => {
    const requestText = document.getElementById('userRequest').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!requestText && !document.getElementById('templateSelect').value) {
        alert('Please enter a description for the PWA or select a template.');
        return;
    }
    if (!apiKey) {
        alert('Please enter your API key.');
        return;
    }

    let generatedHTML, generatedCSS, generatedJS;

    // Check if user selected a template
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (selectedTemplate) {
        try {
            // Updated fetch URL to use absolute path
            const response = await fetch('/static/templates.json');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const templates = await response.json();
            const template = templates.templates[selectedTemplate];
            if (template) {
                generatedHTML = template.html;
                generatedCSS = `<style>${template.css}</style>`;
                generatedJS = `<script>${template.js}</script>`;
            }
        } catch (error) {
            console.error("Error loading templates:", error);
            alert('Failed to load templates. Please check your internet connection or try again later.');
            return;
        }
    } else {
        // Call OpenAI API if no template is selected
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: 'Generate a complete PWA based on the user request. Include HTML, CSS, and JavaScript as separate code blocks. Ensure the JavaScript does not contain syntax errors.' },
                        { role: 'user', content: requestText }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error('API call failed');

            const data = await response.json();
            console.log("🔹 API Response:", data); // LOG API RESPONSE TO DEBUG

            let content = data.choices[0].message.content;
            let splitContent = content.split("```"); // Split content at code blocks

            let htmlBlock = splitContent.find(block => block.includes("<html>")) || "<h1>Error: No valid HTML received.</h1>";
            let cssBlock = splitContent.find(block => block.includes("css")) || "";
            let jsBlock = splitContent.find(block => block.includes("script")) || "";

            console.log("🔹 Extracted HTML:", htmlBlock);
            console.log("🔹 Extracted CSS:", cssBlock);
            console.log("🔹 Extracted JS:", jsBlock);

            generatedHTML = htmlBlock;
            generatedCSS = `<style>${cssBlock}</style>`;
            generatedJS = `<script>${jsBlock}</script>`;

        } catch (error) {
            console.error("Error generating PWA:", error);
            alert('Failed to generate PWA. Please try again later.');
            return;
        }
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

// Load templates into dropdown menu with error handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Updated fetch URL to use absolute path
        const response = await fetch('/static/templates.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const templates = await response.json();
        const select = document.getElementById('templateSelect');
        for (const key in templates.templates) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = templates.templates[key].name;
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        alert("Failed to load templates. Ensure '/static/templates.json' is accessible.");
    }
});
