/**
 * Auto-selects the "Squash commit" option in the autocompletion panel after it opens.
 * @module
 */

import { waitUntil } from './utils/waitUntil';

/**
 * Checks if the current PR is a feature PR that will merge into `develop`.
 */
const isFeaturePR = async () => {
  await waitUntil(() => document.querySelector('.pr-header-branches'));

  const prBranches = document.querySelectorAll('.pr-header-branches')[0];
  const [sourceBranchName, targetBranchName] = Array.from(
    prBranches.querySelectorAll('a.bolt-link'),
  ).map((a: HTMLLinkElement) => a?.innerText);

  if (!sourceBranchName || !targetBranchName) {
    return false;
  }

  const isFeatureBranch = sourceBranchName.includes('feature/');
  const willMergeIntoDevelop = targetBranchName === 'develop';
  return isFeatureBranch && willMergeIntoDevelop;
};

const getAutoCompleteButton = (parentNode = document) =>
  Array.from(parentNode.querySelectorAll('button')).find(
    (button) => button.innerText === 'Set auto-complete',
  );

const hasAutoCompleteButton = () => waitUntil(getAutoCompleteButton);

const getAutocompletionPanel = () => {
  const panelTitle = Array.from(
    document.querySelectorAll('div[role="heading"]'),
  ).find(
    (heading: HTMLDivElement) =>
      heading.innerText === 'Enable automatic completion',
  ) as HTMLDivElement;
  const panel = document.querySelector(
    `div[aria-labelledby="${panelTitle?.id}"]`,
  );
  return panel;
};

const handleAutoCompleteButtonClick = () => {
  waitUntil(getAutocompletionPanel).then(async () => {
    const DESIRED_AUTOCOMPLETE_VALUE = 'Squash commit';

    const autocompletionPanel = getAutocompletionPanel() as HTMLDivElement;
    const autoCompleteInput = autocompletionPanel.querySelector(
      'input[autocomplete]',
    ) as HTMLInputElement;
    // const autoCompleteInputButton = autocompletionPanel.parentNode as HTMLButtonElement;

    autoCompleteInput.click();

    await waitUntil(
      () => autoCompleteInput.attributes['aria-expanded']?.value === 'true',
    );

    const menuControlsId: string =
      autoCompleteInput.attributes['aria-controls']?.value;

    await waitUntil(() => document.getElementById(menuControlsId));

    const menuControls = document.getElementById(menuControlsId);

    await waitUntil(
      () => menuControls.querySelectorAll('[role="option"]').length > 0,
    );

    const autoCompleteOption = Array.from(
      menuControls?.querySelectorAll('[role="option"]'),
    ).find((option: HTMLOptionElement) =>
      option.innerText.includes(DESIRED_AUTOCOMPLETE_VALUE),
    ) as HTMLButtonElement;

    autoCompleteOption.click();

    await waitUntil(
      () => autoCompleteInput.value === DESIRED_AUTOCOMPLETE_VALUE,
    );
  });
};

async function main() {
  hasAutoCompleteButton().then(async () => {
    if (!(await isFeaturePR())) {
      return;
    }

    const autoCompleteButton = getAutoCompleteButton();

    autoCompleteButton.style.border = '1px dashed grey';

    autoCompleteButton?.addEventListener(
      'click',
      handleAutoCompleteButtonClick,
    );
  });
}

main();
