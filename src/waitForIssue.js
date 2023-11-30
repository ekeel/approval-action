async function waitForIssueToClose(octokit, owner, repo, issueNumber, waitInterval = 1, timeout = 1440) {
    let issue = await octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber
    });

    let haveWaited = 0;

    while (issue.data.state !== 'closed' && haveWaited < timeout) {
        // Wait for 5 minutes before checking again
        await new Promise(resolve => setTimeout(resolve, waitInterval * 60 * 1000));

        issue = await octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber
        });

        haveWaited += waitInterval;
    }
}

module.exports = {
    waitForIssueToClose
};