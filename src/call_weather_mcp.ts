import { query } from "@anthropic-ai/claude-agent-sdk";
import { weatherServer } from "./weather_mcp_custom_tool";

for await (const message of query({
  prompt: "What's the temperature and chance of precipitation in Durham, North Carolina?",
  options: {
    mcpServers: { weather: weatherServer },
    allowedTools: ["mcp__weather__get_temperature", "mcp__weather__get_precipitation_chance"]
  }
})) {
  // "result" is the final message after all tool calls complete
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

// It's currently **82.7°F** in Durham, North Carolina.


/*
Right now in Durham, NC it's **82.7°F**.

Chance of precipitation is **low** — starting at 9% this hour and dropping to roughly 1–2% over the next 12 hours, so rain is very unlikely.
*/
