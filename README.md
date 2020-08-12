
# Github-Asana action

This action integrates asana with github.

### Prerequisites

- Asana account with the permission on the particular project you want to integrate with.
- Must provide the task url in the PR description.

## Inputs

### `asana-pat`

**Required** Your public access token of asana, you can create one at https://app.asana.com/0/developer-console (see [asana docs](https://developers.asana.com/docs/#authentication-basics) for details).

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

```yaml
uses: mavenoid/github-asana-action
with:
  asana-pat: 'Your PAT'
  task-comment: 'View Pull Request Here: '
```