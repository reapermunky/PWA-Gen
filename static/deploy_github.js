document.getElementById('deployGithub').addEventListener('click', async () => {
    const requestText = document.getElementById('userRequest').value;
    if (!requestText) {
        alert('Please enter a description for the PWA or select a template.');
        return;
    }

    let generatedHTML, generatedCSS, generatedJS;

    // Check if user selected a template
    const selectedTemplate = document.getElementById('templateSelect').value;
    if (selectedTemplate) {
        const response = await fetch('static/templates.json');
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
                    { role: 'system', content: 'Generate a complete PWA based on the user request. Include HTML, CSS, and JavaScript as separate code blocks.' },
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

    // Create a GitHub repo structure
    const repoName = `pwa-${Date.now()}`;

    // Push to GitHub using GitHub API (User must provide an access token)
    const githubToken = prompt("Enter your GitHub Personal Access Token:");
    if (!githubToken) {
        alert("GitHub token required for deployment.");
        return;
    }

    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({ name: repoName, auto_init: true })
    });

    if (!response.ok) {
        alert('Failed to create GitHub repository.');
        return;
    }

    alert(`Repository created! Visit: https://github.com/YOUR_USERNAME/${repoName}`);

    // User must manually enable GitHub Pages in repo settings
});
