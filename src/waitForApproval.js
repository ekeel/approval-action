const Core = require('@actions/core');

/**
 * Waits for approval on a GitHub issue.
 * 
 * @param {object} octokit - The Octokit instance.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {number} issueNumber - The issue number.
 * @param {string[]} approvers - An array of usernames of the approvers.
 * @param {string[]} approveWords - An array of words that indicate approval.
 * @param {string[]} rejectWords - An array of words that indicate rejection.
 * @param {number} waitInterval - The interval in minutes to wait before checking for updates.
 * @param {number} timeout - The timeout in minutes for waiting for approval.
 * @returns {Promise<void>} - A promise that resolves when the approval process is complete.
 * @throws {Error} - If the approval process times out or encounters an error.
 */
async function waitForApproval(octokit, owner, repo, issueNumber, approvers, approveWords, rejectWords, minimumApprovals, waitInterval, timeout) {
    try {
        let issue = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number: issueNumber
        });

        let haveWaited = 0;
        let haveApproved = 0;
        let haveRejected = 0;

        Core.info(`Waiting for comment on issue #${issueNumber}.`);

        while (issue.data.state !== 'closed' && haveWaited < timeout) {
            await new Promise(resolve => setTimeout(resolve, waitInterval * 60 * 1000));

            issue = await octokit.rest.issues.get({
                owner,
                repo,
                issue_number: issueNumber
            });

            if (issue.data.comments > 0) {
                const comments = await octokit.rest.issues.listComments({
                    owner,
                    repo,
                    issue_number: issueNumber
                });

                const lastComment = comments.data[comments.data.length - 1];

                if (lastComment.user.login !== 'github-actions[bot]' && approvers.includes(lastComment.user.login)) {
                    const commentBody = lastComment.body.toLowerCase();

                    const approveWordsFound = approveWords.filter(word => commentBody.includes(word));
                    const rejectWordsFound = rejectWords.filter(word => commentBody.includes(word));

                    if (approveWordsFound.length > 0) {
                        haveApproved++;
                        Core.info(`Approved by ${lastComment.user.login} (${haveApproved} of ${minimumApprovals} approvals).`);
                        if (haveApproved >= minimumApprovals) {
                            await octokit.rest.issues.createComment({
                                owner,
                                repo,
                                issue_number: issueNumber,
                                body: `Approved by ${lastComment.user.login}.`
                            });
                            await octokit.rest.issues.update({
                                owner,
                                repo,
                                issue_number: issueNumber,
                                state: 'closed'
                            });
                            break;
                        }
                    } else if (rejectWordsFound.length > 0) {
                        haveRejected++;
                        Core.info(`Rejected by ${lastComment.user.login} (${haveRejected} of ${minimumApprovals} rejections).`);

                        if (haveRejected >= minimumApprovals) {
                            await octokit.rest.issues.createComment({
                                owner,
                                repo,
                                issue_number: issueNumber,
                                body: `Rejected by ${lastComment.user.login}.`
                            });
                            await octokit.rest.issues.update({
                                owner,
                                repo,
                                issue_number: issueNumber,
                                state: 'closed'
                            });
                            break;
                        }
                    }
                }
            }

            haveWaited += waitInterval;
        }

        if (haveWaited >= timeout) {
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: `Timed out after waiting for ${timeout} minutes for approval.`
            });

            await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                state: 'closed'
            });

            Core.setFailed(`Timed out after waiting for ${timeout} minutes for approval.`);

            return false;
        } else if (haveApproved >= minimumApprovals) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        Core.error(error);
        Core.error(error.stack);
        Core.setFailed("Failed to wait for issue comment/timeout.");
    }
}

module.exports = {
    waitForApproval
};