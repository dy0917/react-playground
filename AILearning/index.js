import OpenAI from "openai";
import { getBearerTokenProvider, DefaultAzureCredential } from "@azure/identity";
import tools from "./tools/index.js";
import getWeather from "./tools/getWeather.js";

const endpoint = "https://huangkingsley-3329-resource.services.ai.azure.com/openai/v1";
const deploymentName = "gpt-5-mini";
const tokenProvider = getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://ai.azure.com/.default');

const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: tokenProvider
});



async function main() {
    const question = process.argv.slice(2).join(" ") || "What's the current weather in Seattle?";
    let response = await openai.responses.create({
        model: deploymentName,
        input: question,
        tools,
    });

    while (true) {
        const functionCalls = response.output.filter((item) => item.type === "function_call");
        if (functionCalls.length === 0) {
            console.log(response.output_text);
            return;
        }

        const toolOutputs = await Promise.all(functionCalls.map(async (call) => {
            if (call.name !== "get_weather") {
                throw new Error(`Unsupported tool requested: ${call.name}`);
            }

            const { city } = JSON.parse(call.arguments);
            const weather = await getWeather(city);
            return {
                type: "function_call_output",
                call_id: call.call_id,
                output: JSON.stringify(weather),
            };
        }));

        response = await openai.responses.create({
            model: deploymentName,
            previous_response_id: response.id,
            input: toolOutputs,
            tools,
        });
    }
}

main();