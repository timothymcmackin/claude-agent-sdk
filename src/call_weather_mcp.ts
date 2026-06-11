import { query } from "@anthropic-ai/claude-agent-sdk";
import { weatherServer } from "./weather_mcp_custom_tool";

for await (const message of query({
  prompt: "What's the temperature in Durham, North Carolina?",
  options: {
    mcpServers: { weather: weatherServer },
    allowedTools: ["mcp__weather__get_temperature"]
  }
})) {
  // "result" is the final message after all tool calls complete
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

// It's currently **82.7°F** in Durham, North Carolina.