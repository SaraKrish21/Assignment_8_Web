const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.use(express.json());

var result;

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/chamandb');
var datab = mongoose.connection;
datab.on('error', console.log.bind(console, "connection error"));
datab.once('open', function (_callback) {
    console.log("Connection Establised");

})

//SCHEMA

const sch = {
    name: String,
    email: String,
    password: String
}

const monmodel = mongoose.model("users_chaman", sch);
const uri = 'mongodb://127.0.0.1:27017/chamandb';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//creating the user API
app.post('/user/create', function (req, res) {
    console.log("Calling Create API")

    var username = req.body.name;
    var useremail = req.body.email;
    var userpass = req.body.password;

    let usernameregExp = /^[a-zA-Z]+ [a-zA-Z]+$/;
    let useremailRegExp = /[a-zA-Z0-9]+@northeastern.edu+$/;
    let userpassRegExp = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if (!username.match(usernameregExp)) return res.send("Invalid Name!");
    if (!useremail.match(useremailRegExp)) return res.send("Invalid Email!");
    if (!userpass.match(userpassRegExp)) return res.send("Enter a stronger Password");

    const hash = bcrypt.hash(userpass, 13)


    var input = {
        "name": username,
        "email": useremail,
        "password": hash
    }

    datab.collection('users_chaman').insertOne(input, function (err) {
        if (err) throw err;
        console.log("Record added!");
    });
    return res.send("User has been added to Database!")

});
//editing the user API
app.put("/user/edit", function (req, res) {
    console.log("Calling the edit API...");

    var filteremail = req.body.email;
    var newusername = req.body.name;
    var newuserpass = req.body.password;

    const filter = { email: filteremail };
    const options = { upsert: true };
    const updateData = {
        $set: {
            name: newusername, password: newuserpass
        }
    }
    datab.collection('users_chaman').updateOne(filter, updateData, options, function (err) {
        if (err) throw err;
        console.log("Database edited successfully");
    });
    return res.send("Details has been edited!");
});

//deleting the user API


app.delete('/user/delete', function (req, res) {
    console.log("Calling the delete API..")
    var useremail = req.body.email;
    var input = {
        "email": useremail
    }
    datab.collection('users_chaman').deleteOne(input, function (err) {
        if (err) console.log(err);
        console.log("The user record has been deleted!")
    });
    return res.send("User has been deleted");
});

// get all users API

//get all user details using get api

// get all users API
app.get('/user/getAll', async (req, res) => {
    console.log("Calling the get all Api");
  
    const result = await datab.collection('users_chaman').find().toArray();
  
    res.json(result);
  });


app.get('/', function(req, res){
    res.set({
        'Access-control-Allow-origin':'*'
    });
}).listen(3000)
console.log("listening at 3000");



