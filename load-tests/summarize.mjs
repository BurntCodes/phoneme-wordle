import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const resultsDir = join(dirname(fileURLToPath(import.meta.url)), "results");

const stages = existsSync(resultsDir)
  ? readdirSync(resultsDir)
      .map((name) => ({ name, users: Number(name.match(/^x(\d+)$/)?.[1]) }))
      .filter((stage) => Number.isFinite(stage.users))
      .filter((stage) => existsSync(join(resultsDir, stage.name, "report", "statistics.json")))
      .sort((a, b) => a.users - b.users)
  : [];

if (stages.length === 0) {
  console.log("No finished stages found in load-tests/results/. Run load-tests/run.sh first.");
  process.exit(0);
}

const round = (value, digits = 0) => Number(value).toFixed(digits);

const rows = [];
const notes = [];

for (const stage of stages) {
  const statistics = JSON.parse(readFileSync(join(resultsDir, stage.name, "report", "statistics.json"), "utf8"));
  const total = statistics.Total;

  rows.push(
    `| ${stage.name} | ${stage.users} | ${total.sampleCount} | ${round(total.errorPct, 2)}% | ${round(total.meanResTime)} | ` +
      `${round(total.medianResTime)} | ${round(total.pct1ResTime)} | ${round(total.pct2ResTime)} | ${round(total.pct3ResTime)} | ` +
      `${round(total.maxResTime)} | ${round(total.throughput, 1)} |`,
  );

  const requests = Object.entries(statistics).filter(([label]) => label !== "Total");
  const slowest = requests.sort((a, b) => b[1].pct2ResTime - a[1].pct2ResTime)[0];
  const failing = requests.filter(([, value]) => value.errorCount > 0).sort((a, b) => b[1].errorCount - a[1].errorCount)[0];
  notes.push(
    `- ${stage.name}: slowest request by 95th percentile is "${slowest[0]}" (${round(slowest[1].pct2ResTime)} ms)` +
      (failing ? `; most failures on "${failing[0]}" (${failing[1].errorCount} of ${failing[1].sampleCount})` : "; no failed requests"),
  );
}

const output = [
  "| Stage | Users | Requests | Errors | Mean (ms) | Median (ms) | 90th (ms) | 95th (ms) | 99th (ms) | Max (ms) | Throughput (req/s) |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...rows,
  "",
  ...notes,
  "",
].join("\n");

console.log(output);
writeFileSync(join(resultsDir, "summary.md"), output);
