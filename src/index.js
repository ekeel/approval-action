const Core = require('@actions/core');
const Github = require('@actions/github');

(async () => {
    try {
        const token = Core.getInput('token');
        const minimumApprovals = Core.getInput('minimumApprovals');
        const issueTitle = Core.getInput('issueTitle');
        const issueBody = Core.getInput('issueBody');
        const excludeInitiator = Core.getInput('excludeInitiator');

        const approversInput = Core.getInput('approvers');
        const issueLabelsInput = Core.getInput('issueLabels');
        const approveWordsInput = Core.getInput('approveWords');
        const rejectWordsInput = Core.getInput('rejectWords');

        const approvers = approversInput.split(',').map(approver => approver.trim());
        const issueLabels = issueLabelsInput.split(',').map(label => label.trim());
        const approveWords = approveWordsInput.split(',').map(word => word.trim());
        const rejectWords = rejectWordsInput.split(',').map(word => word.trim());

        const repoContext = Github.context.repo;
        const owner = repoContext.owner;
        const repo = repoContext.repo;

        const octokit = Github.getOctokit(token);

        const opts = Object.fromEntries(Object.entries({
            owner,
            repo,
            issueTitle,
            body: issueBody,
            labels: issueLabels && issueLabels.length > 0 ? issueLabels : undefined,
            assignees: approvers
        }).filter(([_, v]) => v !== undefined));

        const issue = await octokit.issues.create(opts);
    } catch (error) {
        Core.error(error);
        Core.setFailed(error.message);
    }
})();
