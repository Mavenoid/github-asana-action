const core = require('@actions/core');
const github = require('@actions/github');
const asana = require('asana');

async function asanaOperations(
  asanaPAT,
  targets,
  taskId,
  taskComment,
  markCompleted
) {
  try {
    const client = asana.Client.create({
      defaultHeaders: { 'asana-enable': 'new-sections,string_ids' },
      logAsanaChangeWarnings: false
    }).useAccessToken(asanaPAT);

    const task = await client.tasks.findById(taskId);
    
    targets.forEach(async target => {
      let targetProject = task.projects.find(project => project.name === target.project);
      if (targetProject) {
        let targetSection = await client.sections.findByProject(targetProject.gid)
          .then(sections => sections.find(section => section.name === target.section));
        if (targetSection) {
          await client.sections.addTask(targetSection.gid, { task: taskId });
          core.info(`Moved to: ${target.project}/${target.section}`);
        } else {
          core.error(`Asana section ${target.section} not found.`);
        }
      } else {
        core.info(`This task does not exist in "${target.project}" project`);
      }
    });

    if (taskComment) {
      await client.tasks.addComment(taskId, {
        html_text: taskComment
      });
      core.info('Added the pull request link to the Asana task.');
    }
    if (markCompleted) {
      await client.tasks.update(taskId, {completed: true});
      core.info('Marked the Asana task as completed.');
    }
  } catch (ex) {
    console.error(ex.value);
  }
}

try {
  const ASANA_PAT = core.getInput('asana-pat'),
    TARGETS = core.getInput('targets'),
    TRIGGER_PHRASE = core.getInput('trigger-phrase'),
    TASK_COMMENT = core.getInput('task-comment'),
    MARK_COMPLETED = core.getInput('mark-completed'),
    PULL_REQUEST = github.context.payload.pull_request;
  
  const REGEX = /(?:([A-Za-z_]+)\: *)?https\:\/\/app\.asana\.com\/\d+\/\d+\/(\d+)/g;

  let taskComment = null,
    targets = TARGETS? JSON.parse(TARGETS) : [],
    parseAsanaURL = null;

  console.log(`Pull Request Body: ${JSON.stringify(PULL_REQUEST.body)}`);

  if (!ASANA_PAT){
    throw({message: 'ASANA PAT Not Found!'});
  }
  if (TASK_COMMENT) {
    console.log(`TASK_COMMENT=${TASK_COMMENT}`)
    taskComment = `${TASK_COMMENT}`.replace(/\$([A-Z0-9_]+)/g, (_, name) => {
      const value = process.env[name];
      return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    })
    console.log(`formatted=${taskComment}`)
  }
  let tasksCount = 0;
  while ((parseAsanaURL = REGEX.exec(PULL_REQUEST.body)) !== null) {
    const trigger = parseAsanaURL[1];
    const taskId = parseAsanaURL[2];
    core.info(`Found asana link: ${parseAsanaURL[2]} (trigger phrase: ${trigger || 'none'})`);
    if (!TRIGGER_PHRASE || tigger === TRIGGER_PHRASE) {
      asanaOperations(ASANA_PAT, targets, taskId, taskComment, MARK_COMPLETED === 'true');
      tasksCount++;
    }
  }
  if (!tasksCount) {
    core.warning(`No matching Asana tasks were found`);
  }
} catch (error) {
  core.error(error.message);
}
