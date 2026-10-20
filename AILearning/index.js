import OpenAI from "openai";
import { getBearerTokenProvider, DefaultAzureCredential } from "@azure/identity";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
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
    const readline = createInterface({ input: stdin, output: stdout });
    let previousResponseId;

    console.log("Chat started. Ask a question, or type 'exit' to quit.");

    try {
        while (true) {
            let message;
            try {
                message = (await readline.question("\nYou: ")).trim();
            } catch (error) {
                if (error.code === "ERR_USE_AFTER_CLOSE") {
                    break;
                }
                throw error;
            }

            if (!message) {
                continue;
            }
            if (["exit", "quit"].includes(message.toLowerCase())) {
                break;
            }

            try {
                let response = await openai.responses.create({
                    model: deploymentName,
                    input: message,
                    tools,
                    ...(previousResponseId
                        ? { previous_response_id: previousResponseId }
                        : {}),
                });

                while (true) {
                    const functionCalls = response.output.filter(
                        (item) => item.type === "function_call",
                    );
                    console.log('functionCalls', functionCalls);
                    if (functionCalls.length === 0) {
                        console.log(`\nAssistant: ${response.output_text}`);
                        previousResponseId = response.id;
                        break;
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
            } catch (error) {
                console.error("\nRequest failed:", error.message);
            }
        }
    } finally {
        readline.close();
    }
}

main().catch((error) => {
    console.error("Chat app failed:", error);
    process.exitCode = 1;
});