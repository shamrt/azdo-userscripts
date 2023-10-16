/**
 * Auto-selects the "Squash commit" option in the autocompletion panel after it opens.
 * @module
 */

import { isFeaturePR } from './utils/isFeaturePR';
import { waitUntil } from './utils/waitUntil';

const getAutoCompleteButton = (
  parentNode = document,
): HTMLButtonElement | undefined =>
  Array.from(parentNode.querySelectorAll('button')).find(
    (button) => button.innerText === 'Set auto-complete',
  );

const hasAutoCompleteButton = () => waitUntil(getAutoCompleteButton);

const getAutocompletionPanel = () => {
  const panelTitle = Array.from(
    document.querySelectorAll(
      'div[role="heading"]',
    ) as NodeListOf<HTMLDivElement>,
  ).find((heading) => heading.innerText === 'Enable automatic completion');
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

    autoCompleteInput.click();

    await waitUntil(
      () => autoCompleteInput.attributes['aria-expanded']?.value === 'true',
    );

    const menuControlsId: string =
      autoCompleteInput.attributes['aria-controls']?.value;

    await waitUntil(() => document.getElementById(menuControlsId));

    const menuControls = document.getElementById(menuControlsId) as HTMLElement;

    await waitUntil(
      () => menuControls.querySelectorAll('[role="option"]').length > 0,
    );

    const autoCompleteOption = Array.from(
      menuControls.querySelectorAll(
        '[role="option"]',
      ) as NodeListOf<HTMLOptionElement>,
    ).find((option) => option.innerText.includes(DESIRED_AUTOCOMPLETE_VALUE));

    autoCompleteOption?.click();

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

    if (!autoCompleteButton) {
      return;
    }

    autoCompleteButton.style.border = '1px dashed grey';

    autoCompleteButton.addEventListener('click', handleAutoCompleteButtonClick);
  });
}

main();
