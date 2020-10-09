const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const mainVersion = Number(process.version.replace("v","").split(".")[0])

// Loop through all the folders and run `npm test`

const blocklist = ["validateModuleExportsMatchCommonJS", "node_modules"];
const filesInTest = fs.readdirSync(__dirname);
const tests = filesInTest
  .filter((f) => fs.statSync(path.join(__dirname, f)).isDirectory())
  .filter((f) => !blocklist.includes(f));

// Support setting up the test node modules
if (!filesInTest.includes("node_modules")) {
  console.log("Installing Deps...");
  spawnSync("npm", ["install"], { cwd: __dirname });
  console.log("Installed");
}

const chalk = require("chalk").default;
for (const test of tests) {
  console.log("---> " + chalk.bold(test));

  const pgkJSON = require(path.join(__dirname, test, "package.json"));

  // Allow skipping things which need a minimum of node 14 (es modules)
  if (pgkJSON.engines && pgkJSON.engines.node) {
    const minVersion = Number(pgkJSON.engines.node)
    if (minVersion > mainVersion) {
      console.log("Skipping")
      continue
    }
  }

  // The webpack 5 tests have unique deps
  if (pgkJSON.dependencies || pgkJSON.devDependencies) {
    const nodeModsInstalled = fs.existsSync(path.join(__dirname, test, "node_modules"));
    if (!nodeModsInstalled) {
      spawnSync("npm", ["install"], { cwd: path.join(__dirname, test) });
    }
  }
  
  // Run the test command
  const results = spawnSync("npm", ["test"], { cwd: path.join(__dirname, test) });
  console.log(results.stdout.toString())
  if (results.status) {
    console.log(chalk.bold.red("Error running test: ") + chalk.bold(test))
    console.log(results.stderr.toString())
    console.log(chalk.bold.red("^^^ Error running test: ") + chalk.bold(test))
    process.exitCode = results.status
  }
}

