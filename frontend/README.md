# React Playground

## Start the apps

From the repository root, install the frontend and backend dependencies, then run them in separate terminals:

```sh
npm --prefix frontend install
npm --prefix backend install
npm --prefix frontend run dev
```

In a second terminal:

```sh
npm --prefix backend run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to Express at `http://127.0.0.1:4173`. Generated pages are served by Express under `/productCodeStore/`.

## Configure Gemini

Set `GEMINI_API_KEY` in `backend/.env`. The key is read only by the backend and must not use a `VITE_` prefix.

Optional backend settings include `GEMINI_MODEL`, `PORT`, `HOST`, and `APP_URL`. If changing the backend port, set `VITE_BACKEND_URL` for Vite to the same backend origin.

## Configure Amazon Bedrock

Set `LLM_PROVIDER=bedrock` in `backend/.env` to use Amazon Bedrock instead of Gemini. Configure `OPENAI_API_KEY` with a Bedrock API key and optionally set `OPENAI_BASE_URL` to the Bedrock Mantle Responses API endpoint (for example, `https://bedrock-mantle.ap-southeast-2.api.aws/v1`). If no base URL is set, the backend derives it from `AWS_REGION`. The default model is `anthropic.claude-haiku-4-5`; override it with `OPENAI_MODEL` if needed. Existing `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and `ANTHROPIC_WORKSPACE_ID` settings are accepted as fallbacks during migration.

The backend uses the OpenAI SDK's streaming Responses API and collects the text before validating and saving the generated files. Bedrock API-key usage requires permission to invoke the model through the Bedrock Mantle endpoint. Gemini remains the default when `LLM_PROVIDER` is unset.
