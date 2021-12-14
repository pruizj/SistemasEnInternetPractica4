import { ApolloError } from "apollo-server";
import { Db, ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";
const config = require('../config');
const bcryptjs = require('bcryptjs');
import { connectDB } from "../mongo";

export const Query ={
    signin: async (parent:any, args:any, {collection,email,password,res}:{collection:any,email:string,password:string,res:any}) => {
        
        if(email == null || password == null){
            res.status(403);
            return "No headers";
        }

        const user = await collection.findOne({ email: email });
        if (user) {
          res.status(403);
          return "User already exists";
        }
    
        const hash_password = await bcryptjs.hash(password, config.BCRYPT_SALT);
        await collection
          .insertOne({
            "email": email,
            "pwd": hash_password,
            "token": undefined,
            "recipes": []
          });
    
        res.status(200);
        return "You've been register";
    
      },
    
    login: async (parent:any, args:any, {collection,email,password,res}:{collection:any,email:string,password:string,res:any}) => {
        const token_key: string = uuid();

        if(email == null || password == null){
            res.status(403);
            return "No headers";
        }

        const user = await collection.findOne({ email: email });
        if (!user) {
            res.status(403);
            return "User does not exist";
        }
        
        const isMatch = await bcryptjs.compare(password, user.pwd)
        if(isMatch){
            const filter = { email: email };
            const updateDoc = {
                $set: {
                token: token_key
                }
            };
            await collection.updateOne(filter, updateDoc);

            res.status(200);
            return token_key;
        }
        res.status(403);
        return "Incorrect password";
    },

    signout: async (parent:any, args:any, {collection,token,res}:{collection:any,token:string,res:any}) => {
        if(token == null){
            res.status(403);
            return "No headers";
        }

        const user = await collection.findOne({ token: token });
        if (!user) {
            res.status(403);
            return "User does not exist";
        }

        await collection.deleteOne({ token: token });
        res.status(200);
        return "User delete";
    },

    logout: async (parent:any, args:any, {collection,token,res}:{collection:any,token:string,res:any}) => {
      
        if (token == null) {
          res.status(500);
          return "No token";
        }
      
        const user = await collection.findOne({ token: token });
        if (!user) {
          res.status(500);
          return "Error, failed to logout";
        }
      
        const filter = { token: token };
        const updateDoc = {
          $set: {
            token: undefined
          }
        };
        await collection.updateOne(filter, updateDoc);
      
        res.status(200);
        return "You have logged out";
    },
  
    getRecipes: async (parent:any, {author, ingredient}:{author:string,ingredient:string}, {res}:{res:any}) => {
      const db = await connectDB();
      const collection_rec = db.collection("recetas");
      const recipes = await collection_rec.find({}).toArray();
      return recipes;
    },

    getRecipe: async (parent:any, {id}:{id:string}, {res}:{res:any}) => {
      const db = await connectDB();
      const collection_rec = db.collection("recetas");
      const recipe = await collection_rec.findOne({_id: new ObjectId(id)});
      if(recipe){
        return recipe;
      }else{
        return "Recipe does not exist";
      }
    },

    getUser: async (parent:any, {id}:{id:string}, {res}:{res:any}) => {
      const db = await connectDB();
      const collection = db.collection("usuarios");
      const user = await collection.findOne({_id: new ObjectId(id)});
      if(user){
        return user;
      }else{
        return "Recipe does not exist";
      }
    },

    getUsers: async (parent:any, args:any, {res}:{res:any}) => {
      const db = await connectDB();
      const collection = db.collection("usuarios");
      const users = await collection.find({}).toArray();
      if(users){
        return users;
      }else{
        return "Recipe does not exist";
      }
    },
}

export const Recipe = {
  ingredients: (parent:{ingredients: number[]}, args:any, {ingredients}: {ingredients:any}) => {
      console.log("Ingredientes");
      return parent.ingredients.map((index)=> ({
          name: ingredients[index].name,
          _id: index,
          recipes : ingredients[index].recipes
      }))
  }
}

export const Ingredient = {
  recipes:(parent: {_id:number, name:string}, args:any, {recipes}:{recipes:any}) =>{
      return recipes.filter((r: { ingredients: any[]; }) => r.ingredients.some((i:number) => r.ingredients[i].name === parent.name));
  }
}
