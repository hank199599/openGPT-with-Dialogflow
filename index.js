'use strict';

const functions = require("firebase-functions");
const {WebhookClient} = require('dialogflow-fulfillment');
require('dotenv').config()
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

//console.log(process.env.OPENAI_API_KEY); //chris

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.chatGPT = functions.https.onRequest((request, response) => {

  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  /**
   * 
   * @param {*} agent 
   * @see "https://beta.openai.com/docs/api-reference/completions/create?lang=node.js"
   * @returns string
   */
  function welcome(agent) {  
    return new Promise(

      function(resolve, reject) {
        openai.createCompletion({
          model: "text-davinci-003",
          // model:'text-curie-001',
          prompt: request.body.queryResult.queryText,
          max_tokens: 200,
          temperature: 0, // Higher values means the model will take more risks. 
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.6,
          stop: ["。","4."],
        },
        {
          timeout: 5000, // dialogflow required the limit is in 5ns
          //maxContentLength: 76,
        }).then(function(response) {
            resolve(response.data.choices[0].text.trim()+"。")
          }).catch(function(error) {
              reject(error)
          });
      }).then( function( returnedMessage ){
        console.log("input message:"+ request.body.queryResult.queryText)
        console.log("return message:"+returnedMessage)
        agent.add(returnedMessage);
        return Promise.resolve();
      })
      .catch( function( err ){
        console.log(err)
        agent.add("發生未預期的錯誤");
        agent.add(new Card({
                title: `Error message`,
                text: `${err}`,
              })
            );
        return Promise.resolve();  // Don't reject again, or it might not send the reply
      })
  }
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Input Intent', welcome);

  agent.handleRequest(intentMap);
});
