const {
  DefaultAzureCredential,
} = require("@azure/identity");

const {
  ResourceGraphClient,
} = require("@azure/arm-resourcegraph");

const {
  normalizeAzureResources,
} = require("./azureResourceNormalizer");

const {
  scanResources,
} = require("./securityScanner");

const credential =
  new DefaultAzureCredential();

const client =
  new ResourceGraphClient(credential);

const getAzureResources = async () => {
  const subscriptionId =
    process.env.AZURE_SUBSCRIPTION_ID;

  if (!subscriptionId) {
    throw new Error(
      "AZURE_SUBSCRIPTION_ID is missing in environment variables."
    );
  }

  const query = `
    Resources
    | project
        id,
        name,
        type,
        resourceGroup,
        location,
        identity,
        kind,
        tags,
        properties
    | order by type asc
  `;

  const response =
    await client.resources({
      subscriptions: [
        subscriptionId,
      ],

      query,

      options: {
        resultFormat:
          "objectArray",
      },
    });

  const rawResources =
    Array.isArray(response.data)
      ? response.data
      : [];

  // Step 1:
  // Convert raw Azure Resource Graph data
  // into CloudGuard resource format.
  const normalizedResources =
    normalizeAzureResources(
      rawResources
    );

  // Step 2:
  // Run CloudGuard security rules.
  const scannedResources =
    scanResources(
      normalizedResources
    );

  return scannedResources;
};

module.exports = {
  getAzureResources,
};