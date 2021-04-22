
const urllib = require("urllib");


module.exports = function (account, insertKey = '') {
  const _insightsEndpoint = `https://insights-collector.newrelic.com/v1/accounts/${account}/events`;
  const _insertKey= insertKey;

  function postEvents(events) {

    return new Promise((resolve, reject) => {
      var options = {
        method: 'POST',
        headers: {
          'X-Insert-Key': _insertKey,
          'Content-Type': 'application/json'
        },
        data: events,
        dataType: 'json'
      };

      console.log('postEvents\n', JSON.stringify(options));

      urllib.request(_insightsEndpoint, options, (err, data, response) => {
        const { statusCode, statusMessage } = response;

        if (statusCode > 302) {
          console.log(`postEvents() failed`);
          console.log(`Failed to post w/ statusCode=${statusCode} message=${statusMessage}`);
          reject({ statusCode, statusMessage });
        } else {
          resolve({statusCode, statusMessage });
        }

      })
    })

  }

  return{
    postEvents
  }

}
