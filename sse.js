const SSE = require("sse");

module.exports = (server, app) => {
  // SSE 모듈을 불러와 new SSE(익스프레스 서버)로 서버 객체를 생성하면 됩니다.
  const sse = new SSE(server);
  sse.on("connection", (client) => {
    // 라우터에서 SSE를 사용하고 싶다면 app.set 메서드로 client 객체를 등록하고, req.app.get 메서드로 가져오면 됩니다.
    // app.set("sse", client);

    // 매개변수로 client 객체를 쓸 수 있습니다. client.send 메서드로 1초마다 접속한 클라이언트에게 서버 시간 타임스탬프를 보내도록 하였습니다. 단, 문자열만 보낼 수 있으므로 숫자인 타임스탬프를 toString 메서드를 사용하여 문자열로 변경하였습니다.
    setInterval(() => {
      client.send(Date.now().toString());
    }, 1_000);
  });
};
