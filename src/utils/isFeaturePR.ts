import { waitUntil } from './waitUntil';

/**
 * Checks if the current PR is a feature PR that will merge into `develop`.
 */
export const isFeaturePR = async () => {
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
