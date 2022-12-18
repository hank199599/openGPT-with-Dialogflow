# openGPT-with-Dialogflow
an project to intergrade OpenAI ChatGPT API to Dialogflow ES

### 系統架構圖
![img/System%20architecture.png](https://github.com/hank199599/openGPT-with-Dialogflow/raw/main/img/System%20architecture.png)

# 如何建立自己的版本？

## STEP 1 :申請OpenAI 的API金鑰
1. 前往 [OpenAI的API keys頁面](https://beta.openai.com/account/api-keys)並登入帳號
2. 點擊 `Create new secret key` 
> 請記住這組金鑰，會在稍後的流程中使用到


## STEP 2 :修改本專案的參數
1. 解壓縮本專案的`function-OpenAI-GPT.zip`
2. 打開`.env`，你會看到以下的內容
```
OPENAI_API_KEY=
```
3. 把方才申請到的參數填入，如下所示
```
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
"
```
4. 儲存更改後的檔案，並以ZIP形式包裝。重新命名為`function.zip`

## STEP 3 :部署到GCP
  1. 建立 [Google Cloud Platform](https://cloud.google.com/free?hl=zh-tw)專案
  2. 建立專案 e.g. `OpenAi-GPT-Linebot`
  3. 於該專案內，前往[Cloud Function](https://console.cloud.google.com/functions/list?authuser=0&hl=zh)頁面
  4. 建立新的Cloud Function  
     1. 點擊『創建函式』
     2. 基本 > 環境 > 選擇『`第2代`』
     3. 選擇『下一步』
     4. `進入點` 更改為 `chatGPT`
     5. `原始碼` 更改為 `上傳ZIP檔`，並上傳剛剛建立的`function.zip`
  5. 等待部署完成後，點擊畫面中的「觸發條件」。複製在畫面中的「`觸發網址`」
  e.g. `https://us-central1-<PROJECT-ID>.cloudfunctions.net/chatGPT`

## STEP 4 :建立 LINE官方賬號
1. 前往[LINE開發者網頁](https://developers.line.biz/en/)
2. 登入或建立帳號
3. 點選上方橫幅的「Products」
4. 選擇頁面中的「Messaging API」，按新頁面中的『Start Now』。  
  依照網頁提示填入以下資訊：
   * Provider Name (如已建立可跳過該步驟直接選取)  
   * Channel name 
   * Channel description 
   * Category
   * Subcategory
   * Email address

   閱讀 [LINE Official Account Terms of Use](https://terms2.line.me/official_account_terms_tw?lang=zh-Hant) 以及 [LINE Official Account API Terms of Use](https://terms2.line.me/official_account_api_terms_tw?lang=zh-Hant)，並同意LINE官方帳號條款後。
   點擊「`Create`」建立你的官方帳號
5. 至此，建立`LINE官方賬號`作業已完成！

## STEP 5 :建立 DialogFlow ES 專案
1. 前往 [DialogFlow ES](https://dialogflow.cloud.google.com/)頁面，點擊畫面中的「`CREATE AGENT`」建立新的聊天機器人專案，
2. 選擇先前在[Google Cloud Platform](https://cloud.google.com/free?hl=zh-tw)建立的專案 e.g. `OpenAi-GPT-Linebot`
3. `DEFAULT LANGUAGE` 選擇 `Chinese (Traditional) — zh-tw`
4. 專案建立完成後，依序點擊： 左方選單「齒輪」 > 「Export and Import」 > 「IMPORT FROM ZIP」  
![pic1](https://github.com/hank199599/Assistant_demo_devfest/raw/master/pic/description-1.png)
5. 選擇要上傳的檔案`dialogflow-ES-agent-OpenAi-GPT.zip`，並點擊「IMPORT」即可
![pic2](https://github.com/hank199599/Assistant_demo_devfest/raw/master/pic/description-2.png)
6. 串接 Fulfillment 
   1. 點選畫面左側的「Fulfillment」
   2. `Webhook`右側的開關打開
   3. 在`URL*`貼上在[ Cloud Function](https://console.cloud.google.com/functions/list?authuser=0&hl=zh)頁面所得到的網址 e.g. `https://us-central1-<PROJECT-ID>.cloudfunctions.net/chatGPT`
   4. 按下下方的`DONE`即可


## STEP 6 :串接 DialogFlow ES 與 LINE官方賬號
1. 一樣在 [DialogFlow ES](https://dialogflow.cloud.google.com/)頁面進行操作
2. 點選畫面左側的「Integrations」
3. 滾輪往下尋找「LINE」，並點擊展開浮動面板（以下稱`LINE串接頁面面板`)
4. 在[LINE開發者網頁](https://developers.line.biz/en/)方才建立的官方帳號頁面中，尋找以下參數。並複製到[DialogFlow ES](https://dialogflow.cloud.google.com/)之中的`LINE串接頁面面板`進行串接：
   * `Channel ID` : 位於 Basic settings > Basic information > Channel ID 
   * `Channel Secret` : 位於 Basic settings > Basic information > Channel secret
   * `Channel Access Token` : 位於 Messaging API > Channel access token > Channel access token (long-lived) (需點擊右方黑色按鈕『Issue』生成一組)
5. 點擊面板下方的「START」使 DialogFlow 開始接收來自 LINE 的訊息並給予回應
6. 複製`LINE串接頁面面板`之中提供的 `Webhook URL`，接著切換頁面到[LINE開發者網頁](https://developers.line.biz/en/)方才建立的官方帳號頁面中的指定位置。
* Messaging API > Webhook settings > Webhook URL，黏貼剛才得到的`Webhook URL`
* Messaging API > Webhook settings > Webhook URL，開啟按鈕使它呈現綠色
6. 前往LINE官方帳號設定，調整官方帳號的回應方式
   * 傳送門位置：Basic settings > Basic information > 下方的 `You can change your app name and icon in LINE Official Account Manager.` 的 [LINE Official Account Manager]()按鈕
   * 進入頁面後，點擊左方面板的「回應設定」
     * Webhook：使按鈕開啟（呈現綠色）
     * 自動回應訊息：使按鈕關閉（呈現灰色）
## STEP 7: 開始對話！
使用手機掃描 Messaging API > QR code 的ＱＲ圖碼，現在即可進行對話啦！

# Q&A
Q: 為何GPT CHAT給我的回應都很短？  
A: 由於 [Dialogflow ES 在Fulfillment回應的時間有5秒的上限](https://cloud.google.com/dialogflow/es/docs/fulfillment-webhook#webhook_response)，導致我們必須針對此情形作妥協。讓OPENAI GPT在遇到句號「`。`」時就會強制中斷生成回應並直接回傳。避免回應等待時間超過5秒而掛掉的問題。  

Q: 有辦法改善這個問題嗎？  
A: 可以用 [DialogFlow CX (須額外付費)](https://dialogflow.cloud.google.com/cx/projects) 客製化 Fulfillment的回應時間上限到30秒，來解決這個問題。

Q: 說好的圖文並茂版在哪裡？  
A: 這部分正在製作中，還請見諒 ><

# Reference
* [beta.openai.com](https://beta.openai.com/docs/api-reference/completions/create?lang=node.js)