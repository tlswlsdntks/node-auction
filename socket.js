const SocketIO = require("socket.io");

module.exports = (server, app) => {
  // 서버 인스턴스와 함께 Socket.IO를 초기화하며, 클라이언트와의 통신 경로를 /socket.io로 지정하는 역할을 합니다.
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  io.on("connection", (socket) => {
    console.log("/ 네임스페이스에 접속");
    setInterval(() => {
      // 3초마다 클라이언트 한 명에게 메시지를 보내는 부분이 있는데, 인자가 두 개입니다. 첫 번째 인자는 이벤트 이름, 두 번째 인자는 데이터입니다. 즉, news라는 이벤트 이름으로 Hello Socket.IO라는 데이터를 클라이언트에 보낸 것입니다. 클라이언트가 이 메시지를 받기 위해서는 news 이벤트 리스너를 만들어두어야 합니다.
      socket.emit("/", "Hello Socket.IO");
    }, 3_000);

    // 소켓 요청(req)에서 referer 헤더를 추출한 후, 해당 URL의 경로에서 마지막 부분(즉, 방 ID)을 가져오는 역할을 합니다. 즉, referer URL의 경로에서 방 ID를 얻기 위해 사용됩니다.
    const req = socket.request;
    const {
      headers: { referer },
    } = req;

    const roomId = new URL(referer).pathname.split("/").at(-1);
    console.log(referer, roomId);

    // 클라이언트 연결 시 주소로부터 경매방 아이디를 받아와 socket.join으로 해당 방에 입장합니다. 연결이 끊겼다면 socket.leave로 해당 방에서 나갑니다.
    socket.join(roomId);
    socket.on("disconnect", () => {
      console.log("/ 네임스페이스에 접속 해제");
      socket.leave(roomId);
    });
  });
};
