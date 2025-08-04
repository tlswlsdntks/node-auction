const { Op } = require("sequelize");
const { Good, Auction, User } = require("../models");

exports.renderMain = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const goods = await Good.findAll({
      where: { SoldId: null, createdAt: { [Op.gte]: yesterday } },
    });
    res.render("main", { title: "NodeAuction", goods });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderJoin = (req, res, next) => {
  try {
    res.render("join", { title: "회원가입 - NodeAuction" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderGood = (req, res, next) => {
  try {
    res.render("good", { title: "상품 등록 - NodeAuction" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createGood = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    await Good.create({
      name,
      img: req.file.filename,
      price,
      OwnerId: req.user.id,
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderAuction = async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        // Good 모델과 User 모델은 현재 일대다 관계가 두 번 연결(owner, sold)되어 있으므로 이런 경우에는 어떤 관계를 include할지 as 속성으로 밝혀주어야 합니다.
        include: {
          model: User,
          as: "Owner",
        },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [["bid", "ASC"]],
      }),
    ]);

    res.render("auction", {
      title: `${good.name} - NodeAuction`,
      good,
      auction,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.bid = async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      // Auction 모델의 bid를 내림차순으로 정렬하고 있습니다.
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    // 해당 상품이 없거나, 시작 가격보다 낮게 입찰했거나, 경매 종료 시간이 지났거나, 이전 입찰가 보다 낮은 입찰가가 들어왔다면 반려합니다.
    if (!good) {
      return res.status(404).send("해당 상품은 존재하지 않습니다.");
    }
    if (good.price >= bid) {
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
    }
    // 날짜로부터 24시간(1일)이 지난 시점이 현재 시간보다 이전인지 여부를 확인하는 조건입니다.
    if (new Date(good.createdAt).valueOf() + 24 * 60 * 60 * 1000 < new Date()) {
      return res.status(403).send("경매가 이미 종료되었습니다.");
    }
    // Good.findOne() 호출 시 Auction 모델과 연관된 데이터를 함께 가져오게 됩니다. Sequelize는 기본적으로 연관된 데이터를 good.Auctions라는 배열로 반환합니다.
    if (good.Auctions[0]?.bid >= bid) {
      return res.status(403).send("이전 입찰가보다 높아야 합니다.");
    }

    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });

    // 해당 경매방의 모든 사람에게 입찰자, 입찰 가격, 입찰 메시지 등을 웹 소켓으로 전달합니다.
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });

    return res.send("ok");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderList = async (req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: { SoldId: req.user.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    res.render("list", { titl: "낙찰 목록 - NodeAuction", goods });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
