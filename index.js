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
const suggestionList= ["你是誰創造的?","你會反抗人類嗎?","介紹GDG","介紹LINE這家公司","用Python倒數10秒鐘","你聽過賈伯斯嗎？","介紹台北的特色","簡單介紹你是誰","你認識馬斯克嗎?","你會取代人類嗎?","一句話介紹台灣","介紹Google"]


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

        const shuffled = suggestionList.sort(() => 0.5 - Math.random()).slice(0, 3);

        agent.add(returnedMessage);
        
        for(let i=0;i<shuffled.length;i++){
          agent.add(new Suggestion(shuffled[i]))
        }

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
  intentMap.set('Input Intent-1', welcome);
  intentMap.set('Input Intent-2', welcome);
  intentMap.set('Input Intent-3', welcome);

  agent.handleRequest(intentMap);
});