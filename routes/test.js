const { test } = require("../test.js");
const express = require("express");
const testRouter = express.Router();
const { verifyJWT } = require("./verifyJWT.js");

test(testRouter, verifyJWT);

exports.testRouter = testRouter;
