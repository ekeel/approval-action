const Core = require('@actions/core');

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