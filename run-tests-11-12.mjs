import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting backend server for Steps 11-12 testing...\n");

// Start backend server
const backendProcess = spawn("bun", ["run", "dev"], {
  cwd: join(__dirname, "apps", "backend"),
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverReady = false;

backendProcess.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  if (output.includes("listening on port")) {
    serverReady = true;
    setTimeout(runTests, 2000);
  }
});

backendProcess.stderr.on("data", (data) => {
  process.stderr.write(data.toString());
});

async function runTests() {
  if (!serverReady) {
    console.log("❌ Server failed to start");
    backendProcess.kill();
    process.exit(1);
  }

  console.log("\n✅ Server ready! Starting Steps 11-12 tests in 2 seconds...\n");
  console.log("📝 Running Steps 11-12 comprehensive tests...\n");

  const testProcess = spawn("bun", ["run", "test-steps-11-12.mjs"], {
    cwd: __dirname,
    shell: true,
    stdio: "inherit",
  });

  testProcess.on("close", (code) => {
    console.log(`\n🛑 Stopping backend server...`);
    backendProcess.kill();
    process.exit(code);
  });
}

// Cleanup on exit
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, cleaning up...");
  backendProcess.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, cleaning up...");
  backendProcess.kill();
  process.exit(0);
});

// Timeout after 5 minutes
setTimeout(() => {
  console.log("\n⏰ Test timeout after 5 minutes");
  backendProcess.kill();
  process.exit(1);
}, 5 * 60 * 1000);
