"use client";

import { useEffect, useState } from "react";

interface DeployInfo {
  projectId: string;
  walletKey: string;
  dbEncryptionKey: string;
  agentAddress?: string;
}

export default function Success() {
  const [info, setInfo] = useState<DeployInfo | null>(null);
  const [keysRevealed, setKeysRevealed] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    // Fetch deploy result from session via a simple endpoint
    fetch("/api/deploy-info")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  if (!info) {
    return (
      <div className="text-center">
        <p className="text-gray-400">Loading deployment details...</p>
      </div>
    );
  }

  const chatLink = info.agentAddress
    ? `https://xmtp.chat/dm/${info.agentAddress}`
    : null;
  const dashboardLink = `https://railway.com/project/${info.projectId}`;

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="text-3xl font-bold mb-2">Agent Deployed</h1>
        <p className="text-gray-400">
          Your XMTP agent is live on the production network
        </p>
      </div>

      <div className="space-y-4">
        {chatLink && (
          <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center font-medium text-white hover:bg-indigo-500 transition"
          >
            Chat with your agent
          </a>
        )}

        <a
          href={dashboardLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-center font-medium text-gray-300 hover:bg-gray-800 transition"
        >
          Open Railway dashboard
        </a>
      </div>

      <div className="mt-8 rounded-lg border border-yellow-800 bg-yellow-900/20 p-4">
        <h2 className="text-sm font-semibold text-yellow-400 mb-2">
          Save your XMTP keys
        </h2>
        <p className="text-sm text-yellow-200/70 mb-3">
          These keys are your agent&apos;s identity. If you lose them, you&apos;ll need to
          deploy a new agent with a new address.
        </p>

        {!keysRevealed ? (
          <button
            onClick={() => setKeysRevealed(true)}
            className="rounded bg-yellow-800/50 px-3 py-1.5 text-sm text-yellow-300 hover:bg-yellow-800/70 transition"
          >
            Reveal keys
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-yellow-400/70 mb-1">
                XMTP_WALLET_KEY
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 block rounded bg-gray-900 px-3 py-1.5 text-xs text-gray-300 overflow-x-auto">
                  {info.walletKey}
                </code>
                <button
                  onClick={() => copyToClipboard(info.walletKey, "wallet")}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  {copied === "wallet" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-yellow-400/70 mb-1">
                XMTP_DB_ENCRYPTION_KEY
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 block rounded bg-gray-900 px-3 py-1.5 text-xs text-gray-300 overflow-x-auto">
                  {info.dbEncryptionKey}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(info.dbEncryptionKey, "encryption")
                  }
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  {copied === "encryption" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
