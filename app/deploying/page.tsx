"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type DeployState = "starting" | "deploying" | "success" | "error";

export default function Deploying() {
  const router = useRouter();
  const [state, setState] = useState<DeployState>("starting");
  const [status, setStatus] = useState("Initializing deployment...");
  const [error, setError] = useState("");
  const deployStarted = useRef(false);

  useEffect(() => {
    if (deployStarted.current) return;
    deployStarted.current = true;

    async function run() {
      try {
        // 1. Trigger the deploy
        setState("starting");
        setStatus("Creating Railway project and deploying agent...");

        const deployRes = await fetch("/api/deploy", { method: "POST" });
        const deployData = await deployRes.json();

        if (deployData.error) {
          throw new Error(deployData.error);
        }

        // 2. Poll for status
        setState("deploying");
        setStatus("Building and deploying...");

        let attempts = 0;
        const maxAttempts = 60; // 5 minutes at 5s intervals

        const poll = async () => {
          if (attempts >= maxAttempts) {
            throw new Error("Deployment timed out. Check your Railway dashboard.");
          }

          const statusRes = await fetch("/api/status");
          const statusData = await statusRes.json();

          if (statusData.error) {
            throw new Error(statusData.error);
          }

          switch (statusData.status) {
            case "SUCCESS":
              setState("success");
              router.push("/success");
              return;
            case "CRASHED":
            case "FAILED":
              throw new Error("Deployment failed. Check the Railway dashboard for logs.");
            case "BUILDING":
              setStatus("Building container...");
              break;
            case "DEPLOYING":
              setStatus("Starting agent...");
              break;
            default:
              setStatus(`Status: ${statusData.status}`);
          }

          attempts++;
          setTimeout(poll, 5000);
        };

        await poll();
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Deployment failed");
      }
    }

    run();
  }, [router]);

  return (
    <div className="w-full max-w-lg text-center">
      <h1 className="text-3xl font-bold mb-6">
        {state === "error" ? "Deployment Failed" : "Deploying Your Agent"}
      </h1>

      {state !== "error" ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
          </div>
          <p className="text-gray-400">{status}</p>
          <p className="text-sm text-gray-500">
            This usually takes 1-2 minutes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
