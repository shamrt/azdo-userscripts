// ==UserScript==
// @name        Userscripts for Azure DevOps
// @namespace   Violentmonkey Scripts
// @description Makes Azure DevOps suck less.
// @match       *://dev.azure.com/*/pullrequest/*
// @version     0.0.1
// @author      Shane Martin
// ==/UserScript==

(function () {
'use strict';

/**
 * Waits until the given condition is true before resolving the promise.
 * @param condition The condition to wait for.
 * @returns A promise that resolves when the condition is true.
 */
function waitUntil(condition) {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve(void 0);
      }
    }, 100);
  });
}

/**
 * Checks if the current PR is a feature PR that will merge into `develop`.
 */
const isFeaturePR = async () => {
  await waitUntil(() => document.querySelector('.pr-header-branches'));
  const prBranches = document.querySelectorAll('.pr-header-branches')[0];
  const [sourceBranchName, targetBranchName] = Array.from(prBranches.querySelectorAll('a.bolt-link')).map(a => a == null ? void 0 : a.innerText);
  if (!sourceBranchName || !targetBranchName) {
    return false;
  }
  const isFeatureBranch = sourceBranchName.includes('feature/');
  const willMergeIntoDevelop = targetBranchName === 'develop';
  return isFeatureBranch && willMergeIntoDevelop;
};

/**
 * Auto-selects the "Squash commit" option in the autocompletion panel after it opens.
 * @module
 */

const getAutoCompleteButton = (parentNode = document) => Array.from(parentNode.querySelectorAll('button')).find(button => button.innerText === 'Set auto-complete');
const hasAutoCompleteButton = () => waitUntil(getAutoCompleteButton);
const getAutocompletionPanel = () => {
  const panelTitle = Array.from(document.querySelectorAll('div[role="heading"]')).find(heading => heading.innerText === 'Enable automatic completion');
  const panel = document.querySelector(`div[aria-labelledby="${panelTitle == null ? void 0 : panelTitle.id}"]`);
  return panel;
};
const handleAutoCompleteButtonClick = () => {
  waitUntil(getAutocompletionPanel).then(async () => {
    var _autoCompleteInput$at2;
    const DESIRED_AUTOCOMPLETE_VALUE = 'Squash commit';
    const autocompletionPanel = getAutocompletionPanel();
    const autoCompleteInput = autocompletionPanel.querySelector('input[autocomplete]');
    autoCompleteInput.click();
    await waitUntil(() => {
      var _autoCompleteInput$at;
      return ((_autoCompleteInput$at = autoCompleteInput.attributes['aria-expanded']) == null ? void 0 : _autoCompleteInput$at.value) === 'true';
    });
    const menuControlsId = (_autoCompleteInput$at2 = autoCompleteInput.attributes['aria-controls']) == null ? void 0 : _autoCompleteInput$at2.value;
    await waitUntil(() => document.getElementById(menuControlsId));
    const menuControls = document.getElementById(menuControlsId);
    await waitUntil(() => menuControls.querySelectorAll('[role="option"]').length > 0);
    const autoCompleteOption = Array.from(menuControls.querySelectorAll('[role="option"]')).find(option => option.innerText.includes(DESIRED_AUTOCOMPLETE_VALUE));
    autoCompleteOption == null || autoCompleteOption.click();
    await waitUntil(() => autoCompleteInput.value === DESIRED_AUTOCOMPLETE_VALUE);
  });
};
async function main() {
  hasAutoCompleteButton().then(async () => {
    if (!(await isFeaturePR())) {
      return;
    }
    const autoCompleteButton = getAutoCompleteButton();
    if (!autoCompleteButton) {
      return;
    }
    autoCompleteButton.style.border = '1px dashed grey';
    autoCompleteButton.addEventListener('click', handleAutoCompleteButtonClick);
  });
}
main();

})();
