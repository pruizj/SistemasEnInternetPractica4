import {gql} from "apollo-server";

export const typeDefs = gql`
type Ingredient{
  _id: ID!
  name: String!
}

input IngredientInput{
  _id: String!
}

type Recipe{
  _id: ID!
  name: String!
  description: String!
  ingredients: [Ingredient!]!
  author: User!
}

type User{
  _id: ID!
  email: String!
  pwd: String!
  token: String
  recipes: [Recipe!]!
}

  type Query{
    getRecipes(author:String,ingredient:ID):[Recipe!]!
    getRecipe(_id:ID!): Recipe!
    getUser(_id:ID!):User!
    getUsers:[User!]!
  }

  type Mutation{
    signin(email:String!,password:String!):String
    login(email:String!,password:String!):String
    signout:String
    logout:String
    addIngredient(name:String!):String
    deleteIngredient(_id:ID!):String
    addRecipe(name:String!, description:String!, ingredients:[IngredientInput!]!): String
    updateRecipe(nameOriginal: String!, name:String, description:String, ingredients:[IngredientInput]):String
    deleteRecipe(_id: ID!):String
  }
`