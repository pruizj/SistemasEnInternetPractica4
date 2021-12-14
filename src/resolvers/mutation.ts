import { Db } from "mongodb";
import { v4 as uuid } from "uuid";
const config = require('../config');
const bcryptjs = require('bcryptjs');
import { connectDB } from "../mongo";

export const Mutation ={

  addIngredient: async (parent:any, {name}:{name:string}, {res}:{res:any}) => {
      const db = await connectDB();
      const collection_ing = db.collection("ingredientes");
      const collection_rec = db.collection("recetas");

      const recipes= await collection_rec.find({}).toArray();
      const arr = recipes.filter(r => r.ingredients.some((i: string) => i === name));

      await collection_ing
      .insertOne({
        "name": name,
        "recipes": arr
      });

      //res.status(200);
      return "Ingredient add";
  },

  deleteIngredient: async (parent:any, {name}:{name:string}, {user,res}:{user: any, res:any}) => {
    const db = await connectDB();
      const collection_ing = db.collection("ingredientes");
      const collection_rec = db.collection("recetas");

      await collection_ing.deleteOne({name:name});

      const recipes= await collection_rec.find({}).toArray();
      const arr = recipes.filter(r => r.ingredients.some((i: string) => i === name));

      for(let i = 0; i < arr.length; i++){
        await collection_rec.deleteMany({name : arr[i].name});
      }
      return "delete Ingredient";
  },

  addRecipe: async (parent:any, {name,description, ingredients}:{name:string,description:string,ingredients:[string]}, {user,res}:{user: any, res:any}) => {
    const db = await connectDB();
    const collection_rec = db.collection("recetas");

    await collection_rec.insertOne({
      name: name,
      description:description,
      ingredients: ingredients,
      author: user.email
    });

    return "add Recipe";
  },

  updateRecipe: async (parent:any, {nameOriginal,name,description, ingredients}:{nameOriginal:string,name:string,description:string,ingredients:[string]}, {user,res}:{user: any, res:any}) => {
    const db = await connectDB();
    const collection_rec = db.collection("recetas");
    let newRecipe = {
      name: "",
      description:"",
      ingredients:[""],
      author: "",
    }

    const receta = await collection_rec.findOne({name:nameOriginal});
    if(receta == null){
      return "Recipe does not exist";
    }
  
    if(receta.author == user.email){
      newRecipe.author = user.email;
      if(name != null){
        newRecipe.name = name;
      }else{
        newRecipe.name = receta.name;
      }

      if(description != null){
        newRecipe.description = description;
      }else{
        newRecipe.description = receta.description;
      }

      if(ingredients != null){
        newRecipe.ingredients = ingredients;
      }else{
        newRecipe.ingredients = receta.ingredients;
      }

      await collection_rec.deleteOne({name: nameOriginal});
      await collection_rec.insertOne(newRecipe);
      return "Recipe update";

    }else{
      return "Recipe is not yours";
    }
  },

  deleteRecipe: async (parent:any, {name,description, ingredients}:{name:string,description:string,ingredients:[string]}, {user,res}:{user: any, res:any}) => {
    const db = await connectDB();
    const collection_rec = db.collection("recetas");

    const receta = await collection_rec.findOne({name:name});
    if(receta == null){
      return "Recipe does not exist";
    }
  
    if(receta.author == user.email){
      await collection_rec.deleteOne({name: receta.name});
      return "Recipe delete";
    }else{
      return "Recipe is not yours";
    }

  },
  


}
