const dotenv = require('dotenv').config();

module.exports ={
  BCRYPT_SALT: process.env.BCRYPT_SALT || 12,
  PORT: process.env.PORT || 3000,
  usr: process.env.usr || "pruizj",
  pwd: process.env.pwd || "1234paula",
  dbName: process.env.dbName || "GraphQL"
}