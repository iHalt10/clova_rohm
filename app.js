const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');

const clovaSkillHandler = clova.Client
    .configureSkill()

    //起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: '形にしたい言葉を言ってください',
        });
    })

    //ユーザーからの発話が来たら反応する箇所
    .onIntentRequest(async responseHelper => {
    const intent = responseHelper.getIntentName();
    const sessionId = responseHelper.getSessionId();
        console.log('dddd');
    console.log('Intent:' + intent);
    if(intent === 'SpeakIntent'){
        const slots = responseHelper.getSlots();
        console.log(slots);
        //デフォルトのスピーチ内容を記載 - 該当スロットがない場合をデフォルト設定
        let speech = {
            lang: 'ja',
            type: 'PlainText',
            value: `すみません、聞き取れませんでした。`
        }
        if(slots.Speak_Type === 'おはよう'){
            speech.value = `テスト、おはよう`;
        }else if(slots.Speak_Type === 'こんにちは'){
          speech.value = `テスト、こんにちは`;
        }
        else if(slots.Speak_Type === 'こんばんは'){
          speech.value = `テスト、こんばんは`;
        }
        responseHelper.setSimpleSpeech(speech);
        responseHelper.setSimpleSpeech(speech, true);
    }
})

    //終了時
    .onSessionEndedRequest(responseHelper => {
        const sessionId = responseHelper.getSessionId();
    })
    .handle();


const app = new express();
const port = process.env.PORT || 3000;

//リクエストの検証を行う場合。環境変数APPLICATION_ID(値はClova Developer Center上で入力したExtension ID)が必須
const clovaMiddleware = clova.Middleware({applicationId: 'com.rohm.takeaki'});
app.post('/clova', clovaMiddleware, clovaSkillHandler);

app.listen(port, () => console.log(`Server running on ${port}`));
