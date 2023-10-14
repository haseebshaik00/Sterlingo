const express = require("express");
const userController = require("../controllers/user_controller");
const app = express();

app.get("/users", userController.getUsers);
app.post("/users", userController.addUser);
app.get("/users/:username", userController.getUserByUsername);
app.delete("/users/:username", userController.deleteUser);

module.exports = app;
