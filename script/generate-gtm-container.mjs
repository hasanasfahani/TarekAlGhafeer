import fs from "node:fs";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node script/generate-gtm-container.mjs <published-export.json> <output.json>",
  );
}

const exportData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const container = exportData.containerVersion;

const template = (key, value) => ({ type: "TEMPLATE", key, value });
const boolean = (key, value) => ({ type: "BOOLEAN", key, value: String(value) });
const eventParameter = (parameter, parameterValue) => ({
  type: "MAP",
  map: [
    template("parameter", parameter),
    template("parameterValue", parameterValue),
  ],
});

const tagByName = (name) => {
  const tag = container.tag.find((candidate) => candidate.name === name);
  if (!tag) throw new Error(`Missing GTM tag: ${name}`);
  return tag;
};

const variableByName = (name) => {
  const variable = container.variable.find((candidate) => candidate.name === name);
  if (!variable) throw new Error(`Missing GTM variable: ${name}`);
  return variable;
};

const setDataLayerName = (variable, dataLayerName) => {
  const nameParameter = variable.parameter.find((parameter) => parameter.key === "name");
  if (!nameParameter) throw new Error(`Variable ${variable.name} has no name parameter`);
  nameParameter.value = dataLayerName;
};

const addDataLayerVariable = (variableId, name, dataLayerName) => {
  if (container.variable.some((variable) => variable.name === name)) return;
  container.variable.push({
    accountId: container.container.accountId,
    containerId: container.container.containerId,
    variableId: String(variableId),
    name,
    type: "v",
    parameter: [
      { type: "INTEGER", key: "dataLayerVersion", value: "2" },
      boolean("setDefaultValue", false),
      template("name", dataLayerName),
    ],
    formatValue: {},
  });
};

const setGa4Parameters = (tagName, parameters) => {
  const tag = tagByName(tagName);
  const settings = tag.parameter.find(
    (parameter) => parameter.key === "eventSettingsTable",
  );
  if (!settings) throw new Error(`Tag ${tagName} has no event settings table`);
  settings.list = parameters.map(([name, value]) => eventParameter(name, value));
};

const setHtml = (tagName, html) => {
  const tag = tagByName(tagName);
  const htmlParameter = tag.parameter.find((parameter) => parameter.key === "html");
  if (!htmlParameter) throw new Error(`Tag ${tagName} has no HTML parameter`);
  htmlParameter.value = html;
};

setDataLayerName(variableByName("DLV - coach_name"), "coach_name");

[
  [35, "DLV - coach_id", "coach_id"],
  [36, "DLV - domain", "domain"],
  [37, "DLV - challenge_id", "challenge_id"],
  [38, "DLV - package_id", "package_id"],
  [39, "DLV - package_name", "package_name"],
  [40, "DLV - cta_location", "cta_location"],
  [41, "DLV - payment_method", "payment_method"],
  [42, "DLV - payment_path", "payment_path"],
  [43, "DLV - items", "items"],
].forEach(([id, name, dataLayerName]) =>
  addDataLayerVariable(id, name, dataLayerName),
);

const identityParameters = [
  ["coach_id", "{{DLV - coach_id}}"],
  ["coach_name", "{{DLV - coach_name}}"],
  ["domain", "{{DLV - domain}}"],
  ["challenge_id", "{{DLV - challenge_id}}"],
  ["challenge_name", "{{DLV - challenge_name}}"],
  ["package_id", "{{DLV - package_id}}"],
  ["package_name", "{{DLV - package_name}}"],
];

const commerceParameters = [
  ["value", "{{DLV - value}}"],
  ["currency", "{{DLV - currency}}"],
];

const contextParameters = [
  ["cta_location", "{{DLV - cta_location}}"],
  ["page_type", "{{DLV - page_type}}"],
  ["payment_method", "{{DLV - payment_method}}"],
  ["payment_path", "{{DLV - payment_path}}"],
];

setGa4Parameters("GA4 Event - Registration Form View", [
  ...identityParameters,
  ["page_type", "{{DLV - page_type}}"],
]);
setGa4Parameters("GA4 Event - Form Start", [
  ...identityParameters,
  ["cta_location", "{{DLV - cta_location}}"],
  ["page_type", "{{DLV - page_type}}"],
]);
setGa4Parameters("GA4 Event - Form Step Complete", [
  ...identityParameters,
  ["form_step", "{{DLV - form_step}}"],
  ["form_step_name", "{{DLV - form_step_name}}"],
]);
setGa4Parameters("GA4 Event - Generate Lead - Form Submit", [
  ...identityParameters,
  ...commerceParameters,
  ...contextParameters,
]);
setGa4Parameters("GA4 Event - Begin Checkout", [
  ...identityParameters,
  ...commerceParameters,
  ...contextParameters,
  ["items", "{{DLV - items}}"],
]);
setGa4Parameters("GA4 Event - Purchase - Payment Success", [
  ["transaction_id", "{{DLV - transaction_id}}"],
  ...identityParameters,
  ...commerceParameters,
  ...contextParameters,
  ["items", "{{DLV - items}}"],
]);
setGa4Parameters("GA4 Event - Payment Failed", [
  ...identityParameters,
  ...commerceParameters,
  ...contextParameters,
  ["failure_reason", "{{DLV - failure_reason}}"],
]);

const metaCommon = `
  content_category: 'Fitnet Coaches Website',
  content_ids: ['{{DLV - package_id}}'],
  content_type: 'product',
  coach_id: '{{DLV - coach_id}}',
  coach_name: '{{DLV - coach_name}}',
  domain: '{{DLV - domain}}',
  challenge_id: '{{DLV - challenge_id}}',
  challenge_name: '{{DLV - challenge_name}}',
  package_id: '{{DLV - package_id}}',
  package_name: '{{DLV - package_name}}',
  cta_location: '{{DLV - cta_location}}',
  payment_method: '{{DLV - payment_method}}',
  payment_path: '{{DLV - payment_path}}'`;

setHtml(
  "Meta Pixel - CompleteRegistration - Form Submit",
  `<script>
fbq('track', 'CompleteRegistration', {
  content_name: '{{DLV - coach_name}} - {{DLV - package_name}} Registration',
${metaCommon},
  value: Number('{{DLV - value}}'),
  currency: '{{DLV - currency}}'
});
</script>`,
);

setHtml(
  "Meta Pixel - InitiateCheckout - Payment Started",
  `<script>
fbq('track', 'InitiateCheckout', {
  content_name: '{{DLV - coach_name}} - {{DLV - package_name}} Checkout',
${metaCommon},
  value: Number('{{DLV - value}}'),
  currency: '{{DLV - currency}}'
});
</script>`,
);

setHtml(
  "Meta Pixel - Purchase - Payment Success",
  `<script>
fbq('track', 'Purchase', {
  content_name: '{{DLV - coach_name}} - {{DLV - package_name}} Purchase',
${metaCommon},
  value: Number('{{DLV - value}}'),
  currency: '{{DLV - currency}}',
  transaction_id: '{{DLV - transaction_id}}'
}, {
  eventID: '{{DLV - transaction_id}}'
});
</script>`,
);

const legacyGa4Tag = tagByName("GA4 Event - WhatsApp Click");
legacyGa4Tag.paused = true;
setGa4Parameters("GA4 Event - WhatsApp Click", [
  ...identityParameters,
  ["click_url", "{{Click URL}}"],
  ["page_path", "{{Page Path}}"],
]);

const legacyMetaTag = tagByName(
  "Meta Pixel - Lead - WhatsApp Click - Tarek Alghafeer",
);
legacyMetaTag.paused = true;
setHtml(
  "Meta Pixel - Lead - WhatsApp Click - Tarek Alghafeer",
  "<script>/* Paused: replaced by structured payment_started events. */</script>",
);

container.name = "Fitnet multi-coach dynamic tracking";
container.description =
  "Dynamic coach/package tracking; paid Ziina Purchase only; structured Syria checkout tracking.";
exportData.exportTime = new Date().toISOString().replace("T", " ").replace("Z", "");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(exportData, null, 2)}\n`);

console.log(`Generated ${outputPath}`);
