const TEST_API = 'aiDAZp37skI9MId9HXWjPVetq';

var messagebird = require('messagebird')(process.env.MESSAGE_API || TEST_API);
const recipent = '+917848905168';

const forwardMessage = (body, to = recipent) => {
    var params = {
        'originator': 'TestMessage',
        'recipients': [
          to
      ],
        'body': body
      };
    
      messagebird.messages.create(params, function (err, response) {
        if (err) {
          return console.log(err);
        }
        console.log(response);
      });
}

  module.exports = forwardMessage;