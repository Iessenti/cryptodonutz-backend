const Sequelize = require("sequelize");
const sequelize = new Sequelize("usersdb", "root", "123456", {
  dialect: "mysql",
  host: "localhost",
  define: {
    timestamps: false
  }
})

export const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});