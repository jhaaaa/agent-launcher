const RAILWAY_API = "https://backboard.railway.com/graphql/v2";

async function gql(token: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "));
  }
  return json.data;
}

export async function createProject(token: string, name: string) {
  const data = await gql(token, `
    mutation($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        id
      }
    }
  `, { input: { name } });
  return data.projectCreate.id as string;
}

export async function getEnvironmentId(token: string, projectId: string) {
  const data = await gql(token, `
    query($projectId: String!) {
      project(id: $projectId) {
        environments {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `, { projectId });

  const edges = data.project.environments.edges;
  const prod = edges.find((e: { node: { name: string } }) => e.node.name === "production");
  return (prod?.node.id ?? edges[0]?.node.id) as string;
}

export async function createServiceFromRepo(
  token: string,
  projectId: string,
  repo: string,
) {
  const data = await gql(token, `
    mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) {
        id
      }
    }
  `, {
    input: {
      projectId,
      source: { repo },
    },
  });
  return data.serviceCreate.id as string;
}

export async function setVariables(
  token: string,
  projectId: string,
  environmentId: string,
  serviceId: string,
  variables: Record<string, string>,
) {
  await gql(token, `
    mutation($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }
  `, {
    input: {
      projectId,
      environmentId,
      serviceId,
      variables,
      replace: false,
    },
  });
}

export async function createVolume(
  token: string,
  projectId: string,
  serviceId: string,
  environmentId: string,
  mountPath: string,
) {
  const data = await gql(token, `
    mutation($input: VolumeCreateInput!) {
      volumeCreate(input: $input) {
        id
      }
    }
  `, {
    input: {
      projectId,
      serviceId,
      environmentId,
      mountPath,
    },
  });
  return data.volumeCreate.id as string;
}

export async function triggerDeploy(
  token: string,
  serviceId: string,
  environmentId: string,
) {
  const data = await gql(token, `
    mutation($serviceId: String!, $environmentId: String!) {
      serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId)
    }
  `, { serviceId, environmentId });
  return data.serviceInstanceDeployV2 as boolean;
}

export async function getDeploymentStatus(token: string, serviceId: string) {
  const data = await gql(token, `
    query($serviceId: String!) {
      deployments(
        first: 1
        input: { serviceId: $serviceId }
      ) {
        edges {
          node {
            id
            status
          }
        }
      }
    }
  `, { serviceId });

  const edge = data.deployments.edges[0];
  if (!edge) return { status: "WAITING" };
  return { id: edge.node.id, status: edge.node.status as string };
}

export async function getProjectUrl(token: string, projectId: string) {
  const data = await gql(token, `
    query($projectId: String!) {
      project(id: $projectId) {
        id
      }
    }
  `, { projectId });
  // Railway dashboard URL is deterministic
  return `https://railway.com/project/${data.project.id}`;
}
