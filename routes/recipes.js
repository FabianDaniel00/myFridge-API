const { getRecipes } = require("../recipes/getRecipes.js");
const { getRecipe } = require("../recipes/getRecipe.js");
const { addComment } = require("../recipes/addComment.js");
const { deleteComment } = require("../recipes/deleteComment.js");
const { editComment } = require("../recipes/editComment.js");
const { rateRecipe } = require("../recipes/rateRecipe.js");
const { getRatingData } = require("../recipes/getRatingData.js");
const { addRecipe } = require("../recipes/addRecipe.js");
const { searchGroceries } = require("../recipes/searchGroceries.js");
const { getRecipesCategories } = require("../recipes/getRecipesCategories.js");
const { myFridge } = require("../recipes/myFridge.js");
const { getGroceries } = require("../recipes/getGroceries.js");
const { getFavoriteRecipes } = require("../recipes/getFavoriteRecipes.js");
const { favoriteRecipe } = require("../recipes/favoriteRecipe.js");
const { pool } = require("../db-config");
const { verifyJWT } = require("./verifyJWT.js");

const express = require("express");

const recipesRouter = express.Router();

getRecipes(recipesRouter, pool);
getRecipe(recipesRouter, pool);
addComment(recipesRouter, pool, verifyJWT);
deleteComment(recipesRouter, pool, verifyJWT);
editComment(recipesRouter, pool, verifyJWT);
rateRecipe(recipesRouter, pool, verifyJWT);
getRatingData(recipesRouter, pool);
addRecipe(recipesRouter, pool, verifyJWT);
searchGroceries(recipesRouter, pool, verifyJWT);
getRecipesCategories(recipesRouter, pool);
myFridge(recipesRouter, pool, verifyJWT);
getGroceries(recipesRouter, pool, verifyJWT);
getFavoriteRecipes(recipesRouter, pool, verifyJWT);
favoriteRecipe(recipesRouter, pool, verifyJWT);

exports.recipesRouter = recipesRouter;
