import {ApolloError, ApolloServer} from "apollo-server";
import { typeDefs } from "./schema";
import {Query,Recipe} from "./resolvers/query";
import {Mutation} from "./resolvers/mutation";
import { connectDB } from "./mongo";
const config = require('./config.js');

const resolvers = {
  Query,
  Mutation,
  Recipe,
}

const run =async () => {
  const db = await connectDB();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async({req,res}) => {
      const reqAuth = ["signout", "logout","addIngredient","deleteIngredient","addRecipe","deleteRecipe","updateRecipe"]
      if(reqAuth.some(auth => req.body.query.includes(auth))){
        const token = req.headers.token;
        const user = await db.collection("usuarios").findOne({ token: token });
        if(!user) throw new ApolloError("Not athorized", "403");
        return {
          db,
          user
        }
      }

      return {
        db
      }
    }
  });

  server.listen(config.PORT).then(() => {
    console.log("server escuchando en el puerto 3000");
  });

}

try {
  run();
} catch (e) {
  console.error(e);
}