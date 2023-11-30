const Core = require('@actions/core');

/**
 * Opens a new issue using the provided Octokit instance.
 * 
 * @param {Octokit} octokit - The Octokit instance for making API requests.
 * @param {Object} context - The context object containing repository information.
 * @param {string} issueTitle - The title of the new issue.
 * @param {string} issueBody - The body content of the new issue.
 * @param {string[]} issueLabels - An array of labels to be assigned to the new issue.
 * @param {string[]} approvers - An array of usernames to be assigned as approvers for the new issue.
 * @returns {Promise<Object>} - A promise that resolves to the created issue object.
 * @throws {Error} - If an error occurs while creating the issue.
 */
async function openIssue(octokit, context, issueTitle, issueBody, issueLabels, approvers) {
    try {
        const issue = await octokit.rest.issues.create({
            ...context.repo,
            title: issueTitle,
            body: issueBody,
            labels: issueLabels && issueLabels.length > 0 ? issueLabels : undefined,
            assignees: approvers
        });

        return issue;
    } catch (error) {
        Core.error(error);
        Core.setFailed("Failed to create a new issue.");
    }

    return issue;
}

module.exports = {
    openIssue
};