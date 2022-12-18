'use strict';

const functions = require("firebase-functions");
const {WebhookClient} = require('dialogflow-fulfillment');
require('dotenv').config()
const {Card, Suggestion,Payload} = require('dialogflow-fulfillment');
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config()

//console.log(process.env.OPENAI_API_KEY); //chris

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
var re = new RegExp("。.+");

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
          // APP_DEBUG:true,
          prompt: request.body.queryResult.queryText,
          max_tokens: 176,
          temperature: 0, // Higher values means the model will take more risks. 
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.6,
          stop: ["4.","。"],
        },
        {
          timeout: 4999, // dialogflow required the limit is in 5ns
          //maxContentLength: 200,
        }).then((response)=>{
          let returnedMessage = response.data.choices[0].text.trim()

          console.log(returnedMessage)

          if (returnedMessage.indexOf('\n\n')!==-1){
            returnedMessage = returnedMessage.split('\n\n')[1]
          }

            resolve(returnedMessage)
          }).catch((error)=>{
              reject(error)
          });
      }).then( (returnedMessage )=>{
        console.log("input message:"+ request.body.queryResult.queryText)
        console.log("return message:"+returnedMessage)
        agent.add(returnedMessage);
      })
      .catch(( err )=>{
        console.log(err)
        agent.add("發生未預期的錯誤");
        agent.add(`${err}`);

        // return Promise.resolve();  // Don't reject again, or it might not send the reply
      })
  }
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Input Intent', welcome);
  intentMap.set('Default Fallback Intent', welcome);

  agent.handleRequest(intentMap);
});