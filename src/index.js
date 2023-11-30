const Core = require('@actions/core');
const Github = require('@actions/github');
const Toolkit = require('actions-toolkit');

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

        Core.debug(`Issue title: ${issueTitle}`);
        Core.debug(`Issue body: ${issueBody}`);
        Core.debug(`Approvers: ${approvers}`);
        Core.debug(`Issue labels: ${issueLabels}`);
        Core.debug(`Minimum approvals: ${minimumApprovals}`);
        Core.debug(`Exclude initiator: ${excludeInitiator}`);
        Core.debug(`Approve words: ${approveWords}`);
        Core.debug(`Reject words: ${rejectWords}`);
        Core.debug(`Owner: ${owner}`);
        Core.debug(`Repo: ${repo}`);

        Core.debug('Getting octokit');
        const octokit = Github.getOctokit(token);
        Core.debug('Got octokit');

        Core.debug('Creating issue options object')
        const opts = Object.fromEntries(Object.entries({
            owner,
            repo,
            issueTitle,
            body: issueBody,
            labels: issueLabels && issueLabels.length > 0 ? issueLabels : undefined,
            assignees: approvers
        }).filter(([_, v]) => v !== undefined));
        Core.debug('Created issue options object')

        Core.debug('Creating issue')
        // const issue = await octokit.rest.issues.create(opts);
        
        const issue = await octokit.rest.issues.create({
            owner,
            repo,
            title: issueTitle,
            body: issueBody,
            labels: issueLabels && issueLabels.length > 0 ? issueLabels : undefined,
            assignees: approvers
        });

        Core.debug('Created issue')
    } catch (error) {
        Core.error(error);
        Core.setFailed(error.message);
    }
})();
