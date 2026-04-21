import OpenAI from "openai";

// Initialize OpenAI (Make sure to set your OPENAI_API_KEY in your .env file)
const openai = new OpenAI();

// This is the array that tracks your conversation in the terminal
const conversationHistory = [
    { 
        role: "system", 
        content: `You are an expert Salesforce Developer Assistant. Your primary job... (PASTE THE REST OF THE PROMPT HERE)` 
    }
];

// This is where you tell the AI about your custom GitHub tool
const tools = [
    {
        type: "function",
        function: {
            name: "search_github",
            description: "Searches GitHub for code snippets based on a highly specific query string.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The formatted GitHub search query (e.g., '\"commerce/webstores\" language:apex')"
                    }
                },
                required: ["query"]
            }
        }
    }
];

// The main function you will call whenever the user types in the terminal
export async function runAgent(userMessage) {
    // 1. Add the user's message to the history
    conversationHistory.push({ role: "user", content: userMessage });

    // 2. Send it to OpenAI
    const response = await openai.chat.completions.create({
        model: "gpt-4o", // Always use gpt-4o for coding tasks
        messages: conversationHistory,
        tools: tools,
        tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // 3. Check if the AI decided it needs to run your tool!
    if (message.tool_calls) {
        const toolCall = message.tool_calls[0];
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`[Agent is thinking...] Executing GitHub Search for: ${args.query}`);
        
        // HERE IS WHERE YOU CALL YOUR CUSTOM GITHUB FETCH FUNCTION
        const githubResults = await myCustomGithubFetch(args.query);
        
        // (Then you pass the results back to the AI so it can read them)
    } else {
        // If it didn't use a tool, just print the text answer
        console.log(`Agent: ${message.content}`);
    }
}