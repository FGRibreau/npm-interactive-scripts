#! /usr/bin/env node

const path = require("path");

const fuzzy = require("fuzzy");
const spawn = require("child_process").spawnSync;
const npm = require("npm");

const inquirer = require("inquirer");
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

function promptUser(err, data) {
  // Collect scripts
  const scriptNames = Object.keys(data.scripts).sort((a, b) =>
    a.localeCompare(b)
  );

  // Prompt user
  inquirer
    .prompt({
      pageSize: 1000,
      type: "autocomplete",
      name: "script",
      message: "Script to run",
      source: (_, input) =>
        Promise.resolve(
          fuzzy.filter(input || "", scriptNames).map(el => el.original)
        )
    })
    .then(run)
    .catch(console.error);
}

function run(val) {
  npm.load(() => npm.run(val.script));
}

promptUser(null, require(path.join(process.cwd(), "package.json")));
