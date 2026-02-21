import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateKey } from "@/lib/keys";
import {
  createProject,
  getEnvironmentId,
  createServiceFromRepo,
  setVariables,
  createVolume,
  triggerDeploy,
} from "@/lib/railway";

export async function POST() {
  const session = await getSession();
  const { railwayToken, formData } = session;

  if (!railwayToken || !formData) {
    return NextResponse.json({ error: "Missing session data" }, { status: 400 });
  }

  const walletKey = generateKey();
  const dbEncryptionKey = generateKey();

  try {
    // 1. Create project
    const projectId = await createProject(railwayToken, formData.agentName);

    // 2. Get environment ID
    const environmentId = await getEnvironmentId(railwayToken, projectId);

    // 3. Create service from template repo
    const serviceId = await createServiceFromRepo(
      railwayToken,
      projectId,
      "jhaaaa/xmtp-agent-template",
    );

    // 4. Set all environment variables (skipDeploys is handled by the mutation)
    const variables: Record<string, string> = {
      SYSTEM_PROMPT: formData.systemPrompt,
      AI_PROVIDER: formData.aiProvider,
      XMTP_WALLET_KEY: walletKey,
      XMTP_DB_ENCRYPTION_KEY: dbEncryptionKey,
      XMTP_ENV: "production",
      XMTP_DB_DIRECTORY: "/app/data",
    };

    // Set the appropriate API key based on provider
    if (formData.aiProvider === "openai") {
      variables.OPENAI_API_KEY = formData.apiKey;
    } else {
      variables.ANTHROPIC_API_KEY = formData.apiKey;
    }

    await setVariables(railwayToken, projectId, environmentId, serviceId, variables);

    // 5. Create persistent volume
    await createVolume(railwayToken, projectId, serviceId, environmentId, "/app/data");

    // 6. Trigger deployment
    await triggerDeploy(railwayToken, serviceId, environmentId);

    // Save deploy result to session for the status page
    session.deployResult = {
      projectId,
      serviceId,
      environmentId,
      walletKey,
      dbEncryptionKey,
    };
    await session.save();

    return NextResponse.json({
      projectId,
      serviceId,
      environmentId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
