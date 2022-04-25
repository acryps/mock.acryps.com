const express = require("express");
const version = require("./package.json").version;

const app = express();

const headerSpread = {};

app.use("*", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Origin", "*");

    for (let name in req.headers) {
        if (name in headerSpread) {
            headerSpread[name] += req.headers[name].length;
        } else {
            headerSpread[name] = req.headers[name].length;
        }
    }

    if ("delay" in req.query) {
        setTimeout(() => {
            next();
        }, +req.query.delay);
    } else {
        next();
    }
})

app.get("/version", (req, res) => {
	res.json({
		version
	});
});

app.get("/header-spread", (req, res) => {
	res.json(headerSpread);
});

app.get("/pow/:num", (req, res) => {
	res.json(req.params.num ** 2);
});

app.get("/svg/:cols", (req, res) => {
    const cols = Math.max(1, Math.min(25, req.params.cols));

    res.setHeader("content-type", "image/svg+xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="100" height="100" viewBox="0, 0, 1, 1">
        ${Array(cols).fill().map((_, y) => Array(cols).fill().map((_, x) => `<rect x="${1 / cols * x}" y="${1 / cols * y}" width="${1 / cols}" height="${1 / cols}" fill="#${Array(6).fill().map(() => Math.random().toString(16)[2]).join("")}"></rect>`).join("\n")).join("\n\n")}
    </svg>`);
});

app.get("/slow/:ms", (req, res) => {
    const start = new Date();

    setTimeout(() => {
        res.json({
            start: start.toISOString(),
            end: new Date().toISOString()
        });
    }, req.params.ms);
});

app.get("*", (req, res) => res.end(`<!doctype html><html><body><pre>
<b>ACRYPS FREE MOCK API</b>
all cors allowed!

Modifiers:
?delay=1000
will delay output by 1000ms

Routes:
GET /version
{ version: "1.0.0" }
current mock api version

GET /header-spread
{ "host": 1234, "referer": 10, ... }
added lengths of headers (will change with every request)

GET /pow/5
25
returns 5 to the power of 2

GET /slow/1000
{ start: "<iso date>", end: "<iso date>" }
waits for 1000ms to return data. you can use ?delay to add delay to any request!

GET /svg/4
&lt;!xm ...
returns a 100x100 svg with 4x4 colored tiles (min 1, max 25)

</pre></body></html>`))

app.listen(process.env.PORT || 1899);