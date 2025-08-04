const Sequelize = require("sequelize");

class Good extends Sequelize.Model {
  static initiate(sequelize) {
    Good.init(
      {
        name: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        price: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "Good",
        tableName: "goods",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    // 한 상품에 여러 명이 입찰하므로 상품 모델과 경매 모델도 일대다 관계입니다.
    db.Good.hasMany(db.Auction);
    // 사용자 모델과 상품 모델 간에는 일대다 관계가 두 번 적용됩니다. 사용자가 여러 상품을 등록할 수 있고, 사용자가 여러 상품을 낙찰받을 수도 있기때문입니다. 두 관계를 구별하기 위해 as 속성에 owner, sold로 관계명을 적어주었습니다. 각각 OwnerId, SoldId 컬럼으로 상품 모델에 추가됩니다.
    db.Good.belongsTo(db.User, { as: "Owner" });
    db.Good.belongsTo(db.User, { as: "Sold" });
  }
}

module.exports = Good;
