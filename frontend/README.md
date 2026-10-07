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

Install the backend dependencies, then set `LLM_PROVIDER=bedrock` in `backend/.env` to use Bedrock instead of Gemini. The default Bedrock model is `amazon.nova-lite-v1:0`; override it with `BEDROCK_MODEL_ID` if needed.

Configure the AWS SDK credential chain for the backend process (for example, an AWS profile for local development or an IAM role in AWS), set `AWS_REGION` to a region where the model is available, and grant the identity `bedrock:InvokeModel` permission. Gemini remains the default when `LLM_PROVIDER` is unset.
