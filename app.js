const logger = require('heroku-logger');
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
var kind = -1;

app.get('/', function (req, res) {
    res.sendFile(INDEX);
});

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
        logger.info('UserId', { sessionId: responseHelper.getUser().userId });
        if (intent === 'SpeakIntent') {
            const slots = responseHelper.getSlots();
            let speech = {
                lang: 'ja',
                type: 'PlainText',
                value: `すみません、聞き取れませんでした。`
            }
            if (slots.Speak_Type === 'がんばれ') {
                speech.value = `テスト、がんばれ`;
                kind = 1;
            } else if (slots.Speak_Type === 'かわいい') {
                speech.value = `テスト、かわいい`;
                kind = 2;
            }
            else if (slots.Speak_Type === 'かっこいい') {
                speech.value = `テスト、かっこいい`;
                kind = 3;
            }
            else if (slots.Speak_Type === 'すき') {
                speech.value = `テスト、すき`;
                kind = 4;
            }
            else if (slots.Speak_Type === 'びっくり') {
                speech.value = `テスト、びっくり`;
                kind = 5;
            }
            io.emit('word', {
                str: kind
            });
            responseHelper.setSimpleSpeech(speech);
            responseHelper.setSimpleSpeech(speech, true);
        }
    })

    //終了時
    .onSessionEndedRequest(responseHelper => {
        const sessionId = responseHelper.getSessionId();
    })
    .handle();

//リクエストの検証を行う場合。環境変数APPLICATION_ID(値はClova Developer Center上で入力したExtension ID)が必須
const clovaMiddleware = clova.Middleware({ applicationId: 'com.rohm.takeaki' });
app.post('/clova', clovaMiddleware, clovaSkillHandler);

app.get('/clova', clovaMiddleware, clovaSkillHandler);

app.get("/fetch", function (req, res, next) {
    res.send(kind.toString());
    // res.json({
    //     kind: kind
    // });
    kind = -1;
});

io.on('connection', (socket) => {
    logger.info('Client connected');
    socket.on('disconnect', () => logger.info('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

http.listen(PORT, () => logger.info(`Server running on ${PORT}`));