import {gql} from "apollo-server";

export const typeDefs = gql`
type Ingredient{
  _id: ID!
  name: String!
  recipes: [Recipe!]!
}

input IngredientInput{
  name:String!
}

type Recipe{
  _id: ID!
  name: String!
  description: String!
  ingredients: [Ingredient!]!
  author: User!
}

input RecipeInput{
  name:String!
  ingredients:[ID!]!
}

type User{
  _id: ID!
  email: String!
  pwd: String!
  token: String
  recipes: [Recipe!]!
}

  type Query{
    getRecipes(author:String,ingredient:String):[Recipe!]!
    getRecipe(id:ID!): Recipe!
    getUser(id:ID!):User!
    getUsers:[User!]!
    signin:String
    login:String
    signout:String
    logout:String
  }

  type Mutation{
    addIngredient(name:String!):String
    deleteIngredient(name:String!):String
    addRecipe(name:String!, description:String!, ingredients:[IngredientInput!]!): String
    updateRecipe(nameOriginal: String!, name:String, description:String, ingredients:[IngredientInput]):String
    deleteRecipe(name: String!):String
  }
`