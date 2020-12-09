#! /usr/bin/env node

const path = require("path");

const fuzzy = require("fuzzy");
const spawn = require("child_process").spawnSync;
const npm = require("npm");

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['v', 'verbose']
});
const isVerbose = argv.v || argv.verbose;
const prefilledValue = argv._.length ? argv._.join(' ') : undefined;

const inquirer = require("inquirer");
inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

function promptUser(err, data, verbose = false, defaultInput = undefined) {
  // Collect scripts
  const scripts = Object.entries(data.scripts)
    .map(([name, body]) => verbose ? `${name}\t\t${body}` : name)
    .sort((a, b) => a.localeCompare(b));

  // Prompt user
  inquirer
    .prompt({
      pageSize: 1000,
      type: "autocomplete",
      name: "script",
      message: "Script to run",
      source: (_, input = defaultInput) => Promise.resolve(
          fuzzy.filter(input || "", scripts).map(el => el.original)
        )
    })
    .then(run)
    .catch(console.error);
}

function run(val) {
  npm.load(() => npm.run(val.script));
}

promptUser(null, require(path.join(process.cwd(), "package.json")), isVerbose, prefilledValue);
