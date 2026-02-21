"use client";

import { useState } from "react";

export default function Home() {
  const [agentName, setAgentName] = useState("");
  const [aiProvider, setAiProvider] = useState<"claude" | "openai">("claude");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDeploy(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentName, aiProvider, systemPrompt, apiKey }),
      });

      const { url, error: err } = await res.json();
      if (err) throw new Error(err);

      // Redirect to Railway OAuth
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Agent Launcher</h1>
        <p className="text-gray-400">
          Deploy an XMTP agent without touching a terminal
        </p>
      </div>

      <form onSubmit={handleDeploy} className="space-y-6">
        <div>
          <label htmlFor="agentName" className="block text-sm font-medium mb-1">
            Agent name
          </label>
          <input
            id="agentName"
            type="text"
            required
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="my-cool-agent"
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">AI provider</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAiProvider("claude")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                aiProvider === "claude"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
              }`}
            >
              Claude
            </button>
            <button
              type="button"
              onClick={() => setAiProvider("openai")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                aiProvider === "openai"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
              }`}
            >
              OpenAI
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="systemPrompt"
            className="block text-sm font-medium mb-1"
          >
            System prompt
          </label>
          <textarea
            id="systemPrompt"
            required
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a friendly pirate who gives life advice..."
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
            {aiProvider === "claude" ? "Anthropic" : "OpenAI"} API key
          </label>
          <input
            id="apiKey"
            type="password"
            required
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              aiProvider === "claude" ? "sk-ant-..." : "sk-..."
            }
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Redirecting to Railway..." : "Deploy to Railway"}
        </button>
      </form>
    </div>
  );
}
