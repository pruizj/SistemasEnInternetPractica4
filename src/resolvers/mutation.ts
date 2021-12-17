import { Db, ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";
import {ApolloError} from "apollo-server";
const config = require('../config');
const bcryptjs = require('bcryptjs');
import { connectDB } from "../mongo";

export const Mutation ={
  signin: async (parent:any, {email,password}:{email:string,password:string}, {db}:{db:Db}) => {

    const user = await db.collection("usuarios").findOne({ email: email });
    if (user) {
      throw new ApolloError("User already exists", "403");
    }

    const hash_password = await bcryptjs.hash(password, config.BCRYPT_SALT);
    await db.collection("usuarios")
      .insertOne({
        "email": email,
        "pwd": hash_password,
        "token": undefined,
        "recipes": []
      });

    return "You've been register";

  },

  signout: async (parent:any, args:any, {db,user}:{db:Db,user:any}) => {

    await db.collection("usuarios").deleteOne(user);
    return "User delete";

  },

  login: async (parent:any, {email,password}:{email:string,password:string},{db}:{db:Db}) => {
    const token_key: string = uuid();

    const user = await db.collection("usuarios").findOne({ email: email});
    if (!user) {
      throw new ApolloError("User does not exist", "403");
    }
    
    const isMatch = await bcryptjs.compare(password, user.pwd)
    if(isMatch){
        const filter = { email: email };
        const updateDoc = {
            $set: {
            token: token_key
            }
        };
        await db.collection("usuarios").updateOne(filter, updateDoc);

        return token_key;
    }
    throw new ApolloError("Password incorrect", "403");
  },

  logout: async (parent:any, args:any, {db,user}:{db:Db,user:any}) => {
  
    const filter = { token:user.token };
    const updateDoc = {
      $set: {
        token: undefined
      }
    };
    await db.collection("usuarios").updateOne(filter, updateDoc);
    return "You have logged out";
  },

  addIngredient: async (parent:any, {name}:{name:string}, {db,user}:{db:Db,user:any}) => {
    
    const ingredient = await db.collection("ingredientes").findOne({name:name});
    
    if(ingredient) throw new ApolloError("Ingredient already exists", "403");

    await db.collection("ingredientes")
    .insertOne({
      "name": name,
      "author": user.email
    });

    return "Ingredient add";
  },

  deleteIngredient: async (parent:any, {_id}:{_id:string}, {db,user}:{db:Db, user: any}) => {

    const ingredient  = await db.collection("ingredientes").findOne({_id:new ObjectId(_id), author: user.email});
 
    if(!ingredient) throw new ApolloError("Ingredient is not yours or does not exist", "403");

    await db.collection("ingredientes").deleteOne({_id:new ObjectId(_id)});

    const field = "name";
    const query = {
      ingredients: {_id: _id}
    }
    const recipes = await db.collection("recetas").distinct(field,query);
    
    recipes.forEach(async (i:string) =>{
      await db.collection("recetas").deleteMany({name : i});
    })
    
    return "delete Ingredient";
  },

  addRecipe: async (parent:any, {name,description, ingredients}:{name:string,description:string,ingredients:[string]}, {db,user}:{db:Db,user:any}) => {

    await db.collection("recetas").insertOne({
      name: name,
      description: description,
      ingredients: ingredients,
      author: user.email
    });

    const receta = await db.collection("recetas").findOne({name:name});
    if(receta){
      const filter = { email: user.email };
      const updateDoc = {
          $set: {
            ingredients: [{_id: receta._id.toString() }]
          }
      };
      await db.collection("usuarios").updateOne(filter, updateDoc);
    }

    return "add Recipe";
  },

  updateRecipe: async (parent:any, {nameOriginal,name,description, ingredients}:{nameOriginal:string,name:string,description:string,ingredients:[string]}, {db,user}:{db:Db,user: any}) => {
    
    const receta = await db.collection("recetas").findOne({name:nameOriginal, author: user.email});

    if(!receta) throw new ApolloError("Recipe is not yours or does not exist", "403");

    let newRecipe = {
      name: name || receta.name,
      description: description || receta.description,
      ingredients: ingredients || receta.ingredients,
      author: receta.author,
    }

    const filter = { name: nameOriginal };
    const updateDoc = {
        $set: {
          name: newRecipe.name,
          description: newRecipe.description,
          ingredients: newRecipe.ingredients,
          author: newRecipe.author
        }
    };
    await db.collection("recetas").updateOne(filter, updateDoc);
    
    return "Recipe update";
    
  },

  deleteRecipe: async (parent:any, {_id}:{_id:string}, {db,user}:{db: Db,user: any}) => {

    const receta = await db.collection("recetas").findOne({_id:new ObjectId(_id), author: user.email});
    if(!receta) throw new ApolloError("Recipe is not yours or does not exist", "403");
  
    await db.collection("recetas").deleteOne({_id: receta._id});
    return "Recipe delete";

  },


}
