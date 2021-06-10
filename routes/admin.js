const { getRecipesToAccept } = require("../admin/getRecipesToAccept.js");
const { acceptRecipe } = require("../admin/acceptRecipe.js");
const { declineRecipe } = require("../admin/declineRecipes.js");
const { getCommentsToAccept } = require("../admin/getCommentsToAccept.js");
const { acceptComment } = require("../admin/acceptComment.js");
const { declineComment } = require("../admin/declineComment.js");
const { getUsers } = require("../admin/getUsers.js");
const { blockUser } = require("../admin/blockUser.js");
const { unBlockUser } = require("../admin/unBlockUser.js");
const { deleteUser } = require("../admin/deleteUser.js");
const { pool } = require("../db-config");
const { verifyJWT } = require("./verifyJWT.js");

const express = require("express");
const adminRouter = express.Router();

getRecipesToAccept(adminRouter, pool, verifyJWT);
acceptRecipe(adminRouter, pool, verifyJWT);
declineRecipe(adminRouter, pool, verifyJWT);
getCommentsToAccept(adminRouter, pool, verifyJWT);
acceptComment(adminRouter, pool, verifyJWT);
declineComment(adminRouter, pool, verifyJWT);
getUsers(adminRouter, pool, verifyJWT);
blockUser(adminRouter, pool, verifyJWT);
unBlockUser(adminRouter, pool, verifyJWT);
deleteUser(adminRouter, pool, verifyJWT);

exports.adminRouter = adminRouter;
