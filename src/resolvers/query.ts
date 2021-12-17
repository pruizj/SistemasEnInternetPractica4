import { ApolloError } from "apollo-server";
import { Db, ObjectId } from "mongodb";
import { v4 as uuid } from "uuid";
const config = require('../config');
const bcryptjs = require('bcryptjs');
import { connectDB } from "../mongo";
import {typeDefs} from "../schema";

export const Query ={
    getRecipes: async (parent:any, {author, ingredient}:{author:string,ingredient:string}, {db}:{db:Db}) => {
        
        if(author){
            return await db.collection("recetas").find({author: author}).toArray();
        }
        if(ingredient){
            const recipes = await db.collection("recetas").find({ingredients : [{_id: ingredient}]}).toArray();
            
            return recipes;
        }
        return await db.collection("recetas").find({}).toArray();
    },

    getRecipe: async (parent:any, {_id}:{_id:string}, {db}:{db:Db}) => {
        const recipe = await db.collection("recetas").findOne({_id: new ObjectId(_id)});

        if(!recipe) throw new ApolloError("Recipe does not exist", "403");
        return recipe;
    },

    getUser: async (parent:any, {_id}:{_id:string}, {db}:{db:Db}) => {
        
        const user = await db.collection("usuarios").findOne({_id: new ObjectId(_id)});
        if(!user) throw new ApolloError("User does not exist", "403");
        return user;
    },

    getUsers: async (parent:any, args:any, {db}:{db:Db}) => {
        
        return await db.collection("usuarios").find({}).toArray();
    },
  
}

export const Recipe =  {
    
    ingredients: async (parent:{ingredients: any[]}, args:any, {db}: {db:Db}) => {
        console.log("hola");
        return parent.ingredients.map(async (id)=> ({
            _id: id,
            name: await db.collection("ingredientes").findOne({_id:id})
        }))
    },

    author:  async (parent:{user: string}, args:any, {db}: {db:Db}) =>{
        return db.collection("usuarios").findOne({email: parent.user}); 
    }
}
