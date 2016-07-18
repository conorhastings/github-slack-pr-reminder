const GithubAPI = require('github');
const request = require('superagent');
const color = require('pleasejs');

function sendSlackNotifcation(e, ctx, cb) {
  const github = new GithubAPI({
    protocol: 'https',
    host: 'api.github.com'
  });

  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_API_TOKEN
  });

  github.issues.getAll({filter: 'assigned', per_page: 100}, (err, res) => {
    const colors = color.make_color({colors_returned: res.length});
    if (!err) {
      const attachments = res.map((pr, i) => {
       return {
        fallback: pr.title,
        color: colors[i],
        title: pr.title,
        title_link: pr.html_url,
        text: pr.body
       };
      });
      request
      .get('https://slack.com/api/chat.postMessage')
      .query({
        token :process.env.SLACK_TOKEN,
        channel: process.env.SLACK_USER,
        text: `*Daily PR Reminder - ${res.length} Pending PRs*`,
        attachments: JSON.stringify(attachments),
        username: 'Github Assigned Reminder',
        icon_emoji: process.env.SLACK_BOT_EMOJI || ':octopus:'
      })
      .end((err, res) => {
        cb(err, res);
      });

    }
  });
}

exports.handle = sendSlackNotifcation;
