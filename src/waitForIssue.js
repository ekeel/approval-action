async function waitForIssueToClose(octokit, owner, repo, issueNumber, approveWords, rejectWords, waitInterval = 1, timeout = 1440) {
    let issue = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
    });

    let haveWaited = 0;

    while (issue.data.state !== 'closed' && haveWaited < timeout) {
        // Wait for 5 minutes before checking again
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

            if (lastComment.user.login !== 'github-actions[bot]') {
                const commentBody = lastComment.body.toLowerCase();

                const approveWordsFound = approveWords.filter(word => commentBody.includes(word));
                const rejectWordsFound = rejectWords.filter(word => commentBody.includes(word));

                if (approveWordsFound.length > 0) {
                    await octokit.rest.issues.update({
                        owner,
                        repo,
                        issue_number: issueNumber,
                        state: 'closed'
                    });
                } else if (rejectWordsFound.length > 0) {
                    await octokit.rest.issues.update({
                        owner,
                        repo,
                        issue_number: issueNumber,
                        state: 'closed'
                    });
                }
            }
        }

        haveWaited += waitInterval;
    }
}

module.exports = {
    waitForIssueToClose
};