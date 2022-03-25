const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 8000;

expressWs(app);
app.use(cors());

const websocketConnections = {};
const canvasDraws = [];

app.ws('/', (ws, req) => {
    const id = nanoid();
    websocketConnections[id] = ws;

    console.log('Connected user with id:', id);
    ws.send(JSON.stringify({
        type: 'NEW_DRAW',
        data: canvasDraws
    }));

    ws.on('message', (msg) => {
        try {
            const drawData = JSON.parse(msg);
            switch (drawData.type) {
                case 'SEND_DRAW':
                    canvasDraws.push(drawData.data);
                    Object.keys(websocketConnections).forEach((connId) => {
                       if (connId === id) {
                           return;
                       }

                       const conn = websocketConnections[connId];
                       conn.send(JSON.stringify({
                           type: 'NEW_DRAW',
                           data: [drawData.data]
                       }));
                    });
                    break;
                default:
                    console.log('Unknown type', drawData.type);
            }
        } catch (e) {
            console.log(e);
        }
    });

    ws.on('close', () => {
        delete websocketConnections[id];
        console.log('User disconnected:', id);
    });
});

app.listen(port, () => {
    console.log(`Server started o ${port} port`);
});