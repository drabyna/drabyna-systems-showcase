const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function renderJson(target, value) {
  if (!target) return;
  const escaped = JSON.stringify(value, null, 2)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  target.innerHTML = escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?)/g,
    (match, key, string, boolean, nil, number) => {
      if (key) return `<span class="code-key">${key}</span>`;
      if (string) return `<span class="code-string">${string}</span>`;
      if (boolean) return `<span class="code-boolean">${boolean}</span>`;
      if (nil) return `<span class="code-null">${nil}</span>`;
      return `<span class="code-number">${number}</span>`;
    },
  );
}

const runFlowButton = document.querySelector("#run-flow");
const flowStatus = document.querySelector("#flow-status");
const flowNodes = [...document.querySelectorAll("[data-flow-node]")];
const eventLog = document.querySelector("#event-log");
const apiRequestPayload = document.querySelector("#api-request-payload");
const apiResponsePayload = document.querySelector("#api-response-payload");
const apiResultCode = document.querySelector("#api-result-code");

const flowEvents = [
  ["ORDER", "Commerce API accepted sample order #DRB-1042."],
  ["CHECK", "Payment and sample stock passed validation."],
  ["RELEASE", "Warehouse pack task was created."],
  ["NOTICE", "Customer update was prepared for delivery."],
];

renderJson(apiRequestPayload, {
  event: "order.accepted",
  order_id: "DRB-1042",
  market: "AU",
  expected_units: 3,
  source: "synthetic_demo",
});
renderJson(apiResponsePayload, {
  status: "waiting",
  completed_handoffs: 0,
  next: "validation",
});

runFlowButton?.addEventListener("click", async () => {
  runFlowButton.disabled = true;
  eventLog.innerHTML = "";
  apiResultCode.textContent = "PROCESSING";
  flowNodes.forEach((node) => node.classList.remove("is-active", "is-complete"));

  for (const [index, node] of flowNodes.entries()) {
    node.classList.add("is-active");
    flowStatus.textContent = flowEvents[index][1];
    await wait(520);
    node.classList.remove("is-active");
    node.classList.add("is-complete");

    const item = document.createElement("li");
    item.innerHTML = `<time>${flowEvents[index][0]}</time><span>${flowEvents[index][1]}</span>`;
    eventLog.prepend(item);
    renderJson(apiResponsePayload, {
      status: index === flowNodes.length - 1 ? "complete" : "processing",
      completed_handoffs: index + 1,
      last_event: flowEvents[index][0].toLowerCase(),
      next: flowEvents[index + 1]?.[0].toLowerCase() ?? null,
    });
  }

  flowStatus.textContent = "Synthetic workflow complete. Every handoff is visible.";
  runFlowButton.textContent = "Run again";
  runFlowButton.disabled = false;
  apiResultCode.textContent = "200 OK";
});

let scanIndex = 0;
const scanButton = document.querySelector("#scan-item");
const resetScanButton = document.querySelector("#reset-scan");
const scanCount = document.querySelector("#scan-count");
const scanItems = [...document.querySelectorAll("[data-scan-item]")];
const evidenceTitle = document.querySelector("#evidence-title");
const evidenceCopy = document.querySelector("#evidence-copy");
const evidenceStamp = document.querySelector("#evidence-stamp");
const evidencePayload = document.querySelector("#evidence-payload");

function renderEvidencePayload() {
  renderJson(evidencePayload, {
    order_id: "DRB-1042",
    expected_units: 3,
    verified_scans: scanIndex,
    evidence_status: scanIndex === scanItems.length ? "ready_to_share" : "collecting",
    customer_claim: "received_2_units",
    dispatched_units: scanIndex === scanItems.length ? 3 : null,
  });
}

function beep() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.05, context.currentTime);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.08);
  oscillator.addEventListener("ended", () => context.close());
}

function resetScan() {
  scanIndex = 0;
  scanCount.textContent = "0/3";
  scanItems.forEach((item) => {
    item.classList.remove("is-scanned");
    item.querySelector("b").textContent = "WAITING";
  });
  scanButton.disabled = false;
  scanButton.textContent = "Scan next barcode";
  evidenceTitle.textContent = "Evidence not yet complete.";
  evidenceCopy.textContent = "Each accepted barcode will be linked to this sample order.";
  evidenceStamp.textContent = "AWAITING 3 VERIFIED SCANS";
  renderEvidencePayload();
}

scanButton?.addEventListener("click", () => {
  if (scanIndex >= scanItems.length) return;
  beep();
  const item = scanItems[scanIndex];
  item.classList.add("is-scanned");
  item.querySelector("b").textContent = `ACCEPTED 0${scanIndex + 1}`;
  scanIndex += 1;
  scanCount.textContent = `${scanIndex}/3`;
  renderEvidencePayload();

  if (scanIndex === scanItems.length) {
    scanButton.disabled = true;
    scanButton.textContent = "Pack verified";
    evidenceTitle.textContent = "Evidence clip ready to share.";
    evidenceCopy.textContent = "Customer service can confirm that three garments were scanned and dispatched with this sample order.";
    evidenceStamp.textContent = "VERIFIED · 3 GARMENTS DISPATCHED";
  }
});
resetScanButton?.addEventListener("click", resetScan);

const completePackButton = document.querySelector("#complete-pack");
const pulseMessage = document.querySelector("#pulse-message");
const pulseStatus = document.querySelector("#pulse-status");
const kpiPayload = document.querySelector("#kpi-payload");
let packsAdded = 0;

function renderKpiPayload() {
  const totals = {};
  document.querySelectorAll(".pulse-row:not(.pulse-labels)").forEach((row) => {
    const [period, orders, skus] = row.children;
    totals[period.textContent.toLowerCase()] = {
      orders: Number(orders.dataset.orderTotal),
      skus: Number(skus.dataset.skuTotal),
    };
  });
  renderJson(kpiPayload, {
    metric_set: "decision_kpis",
    last_event: packsAdded ? "pack.completed" : null,
    sample_packs_added: packsAdded,
    totals,
  });
}

renderKpiPayload();

completePackButton?.addEventListener("click", () => {
  packsAdded += 1;
  document.querySelectorAll("[data-order-total]").forEach((item) => {
    item.dataset.orderTotal = String(Number(item.dataset.orderTotal) + 1);
    item.textContent = Number(item.dataset.orderTotal).toLocaleString();
  });
  document.querySelectorAll("[data-sku-total]").forEach((item) => {
    item.dataset.skuTotal = String(Number(item.dataset.skuTotal) + 3);
    item.textContent = Number(item.dataset.skuTotal).toLocaleString();
  });
  pulseMessage.textContent = `Order complete +${packsAdded}`;
  pulseStatus.textContent = `${packsAdded} sample pack${packsAdded === 1 ? "" : "s"} added · ${packsAdded * 3} verified SKUs.`;
  renderKpiPayload();
});

let returnIndex = 0;
const returnSteps = [...document.querySelectorAll("#return-steps li")];
const returnProgress = document.querySelector("#return-progress");
const advanceReturn = document.querySelector("#advance-return");
const resetReturn = document.querySelector("#reset-return");
const returnPayload = document.querySelector("#return-payload");

function renderReturn() {
  returnSteps.forEach((step, index) => {
    step.classList.toggle("is-complete", index < returnIndex);
    step.classList.toggle("is-active", index === returnIndex);
  });
  returnProgress.textContent = `${returnIndex + 1} of ${returnSteps.length}`;
  advanceReturn.textContent = returnIndex === returnSteps.length - 1 ? "Workflow complete" : "Advance workflow";
  advanceReturn.disabled = returnIndex === returnSteps.length - 1;
  renderJson(returnPayload, {
    return_id: "RET-083",
    automation_status: returnIndex === returnSteps.length - 1 ? "complete" : "in_progress",
    current_step: returnSteps[returnIndex].querySelector("b").textContent,
    completed_steps: returnIndex,
    customer_action_required: false,
  });
}

advanceReturn?.addEventListener("click", () => {
  if (returnIndex < returnSteps.length - 1) returnIndex += 1;
  renderReturn();
});
resetReturn?.addEventListener("click", () => {
  returnIndex = 0;
  advanceReturn.disabled = false;
  renderReturn();
});

renderReturn();
renderEvidencePayload();
