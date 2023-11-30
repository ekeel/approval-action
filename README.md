# Approval V1

This action uses repository issues to create manual approvals for a workflow run.

## Usage

```yaml
- uses: ekeel/approval-action@v1
  with:
    # A GitHub token with repo scope.
    # The default secrets.GITHUB_TOKEN does not work with octokit to open/update/close issues.
    token: ${{ secrets.GH_PAT }}

    # A comma separated list of GitHub usernames that are allowed to approve.
    # Example: 'ekeel,octocat'
    approvers: 'ekeel'

    # The number of approvals/rejections required to continue the workflow.
    minimumApprovals: '1'

    # The title of the issue to create.
    issueTitle: 'Test issue title'

    # The body of the issue to create.
    issueBody: 'Test issue body'

    # A comma separated list of labels to add to the issue.
    issueLabels: 'ManualApproval,ApprovalAction'

    # Exclude the workflow initiator from the list of approvers.
    excludeInitiator: 'false'

    # A comma separated list of words that will be used to approve.
    approveWords: 'approve, approved'

    # A comma separated list of words that will be used to reject.
    rejectWords: 'deny, denied, reject, rejected'

    # The number of minutes to wait between checks for approvals.
    waitInterval: '1'

    # The number of minutes to wait before timing out.
    waitTimeout: '5'
```