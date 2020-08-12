
# Github-Asana action

This action integrates asana with github.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with.
- Must provide the task url in the PR description.

## Inputs

### `asana-pat`

**Required** Your public access token of asana, you can create one at https://app.asana.com/0/developer-console (see [asana docs](https://developers.asana.com/docs/#authentication-basics) for details). Alternatively, you can create a [Service Account](https://asana.com/guide/help/premium/service-accounts) to perform these actions.

### `trigger-phrase`

**Optional** Prefix before the task e.g. "closes" woudl match "closes: https://app.asana.com/1/2/3/".

if you do not supply a trigger phrase, all task URLs will match

### `task-comment`

**Optional** If any comment is provided, the action will add a comment to the specified asana task with the text & pull request link.

### `targets`

**Optional** JSON array of objects having project and section where to move current task. Move task only if it exists in target project. e.g 
```yaml
targets: '[{"project": "Backlog", "section": "Development Done"}, {"project": "Current Sprint", "section": "In Review"}]'
```
if you don't want to move task omit `targets`.


## Example usage

Post a link to the PR whenever a PR is opened that mentions an Asana task:

```yaml
name: Link to asana task

on:
  pull_request:
    types: [opened]

jobs:
  link-to-asana:
    runs-on: ubuntu-latest
    steps:
      - uses: mavenoid/github-asana-action@3.0.0
        with:
          asana-pat: ${{ secrets.ASANA_ACCESS_TOKEN }}
          task-comment: "View Pull Request Here: "
```

Mark tasks as completed whenever a PR is merged with "closes: ASANA_TASK" in the description:

```yaml
name: Complete asana task

on:
  pull_request:
    types: [closed]

jobs:
  close-on-asana:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: mavenoid/github-asana-action@3.0.0
        with:
          asana-pat: ${{ secrets.ASANA_ACCESS_TOKEN }}
          trigger-phrase: closes
          task-comment: "Completed By: "
          mark-completed: 'true'
```