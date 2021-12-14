import {ApolloServer} from "apollo-server";
import { typeDefs } from "./schema";
import {Query} from "./resolvers/query";
import {Mutation} from "./resolvers/mutation";
import { connectDB } from "./mongo";
const config = require('./config.js');

const resolvers = {
  Query,
  Mutation
}

const run =async () => {
  const db = await connectDB();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async({req,res}) => {
      const functions = ["signin","login"];
      const func_tokens = ["logout", "signout"];
      const validation = ["addingredient","deleteIngredient", "addRecipe", "updateRecipe","deleteRecipe"];
      const gets = ["getRecipes","getRecipe", "getUser", "getUsers"];

      if(functions.some(f => req.body.query.includes(f))){
        const collection = db.collection("usuarios");
        const email = req.headers.email;
        const password = req.headers.password;       
        return{
          collection,email,password,res
        }            
      }else if(func_tokens.some(t => req.body.query.includes(t))){
        const collection = db.collection("usuarios");
        const token = req.headers.token;
        return{
          collection,token,res
        }
      }else if(validation.some(q => req.body.query.includes(q))){
        const collection = db.collection("usuarios");
        const token = req.headers.token;
        const user = await collection.findOne({ token: token });
        if(user == null){
          res.status(404);
          return "No estas logeado";
        }else{
          return{
            res, user
          }
        }
      }else if(gets.some(g => req.body.query.includes(g))){
        return{
          res
        }
      }else{
        const ingredients = db.collection("ingredients");
        const recetas = db.collection("recetas");
        return{
          ingredients,recetas
        }
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
