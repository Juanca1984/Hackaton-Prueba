// github.js
export async function searchGithub(query) {
    // Format the URL. We use encodeURIComponent to safely handle quotes and spaces.
    const endpoint = `https://api.github.com/search/code?q=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Salesforce-Hackathon-Agent', // GitHub requires a User-Agent
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });

        if (!response.ok) {
            return `GitHub API Error: ${response.status} ${response.statusText}`;
        }

        const data = await response.json();

        // If no results, tell the AI
        if (!data.items || data.items.length === 0) {
            return "No results found for this query.";
        }

        // CRITICAL: Map the massive JSON down to just the essential 3 fields
        // We only take the top 5 results to save AI memory
        const cleanResults = data.items.slice(0, 5).map(item => ({
            repo: item.repository.full_name,
            file_name: item.name,
            html_url: item.html_url
        }));

        // Return the clean data as a string so the AI can read it
        return JSON.stringify(cleanResults, null, 2);

    } catch (error) {
        return `Execution Error: ${error.message}`;
    }
}