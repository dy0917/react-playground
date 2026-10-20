const tools = [{
    type: "function",
    name: "get_weather",
    description: "Get the current weather for a city.",
    parameters: {
        type: "object",
        properties: {
            city: {
                type: "string",
                description: "The city to get the weather for.",
            },
        },
        required: ["city"],
        additionalProperties: false,
    },
    strict: true,
}];

export default tools;