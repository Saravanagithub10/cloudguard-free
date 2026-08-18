const {
  getAzureResources,
} = require("../services/azureResourceService");

const getResources = async (req, res) => {
  try {
    const resources = await getAzureResources();

    return res.status(200).json({
      source: "Azure Resource Graph",
      totalResources: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Azure Resource Graph error:", error);

    return res.status(500).json({
      message: "Unable to retrieve Azure resources.",
      error: error.message,
    });
  }
};

module.exports = {
  getResources,
};