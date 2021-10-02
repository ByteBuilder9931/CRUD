const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "todo";
const app = express();


const schema = Joi.object().keys({
    todo : Joi.string().required()
});

app.use(bodyParser.json());


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});


app.get('/getTodos',(req,res)=>{
   
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});


app.put('/:id',(req,res)=>{
   
    const todoID = req.params.id;
    
    const userInput = req.body;
    
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo}},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);   
    });
});



app.post('/',(req,res,next)=>{
    const userInput = req.body;

    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
    })    
});



app.delete('/:id',(req,res)=>{

    const todoID = req.params.id;
    
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});


db.connect(()=>{
    
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    
    else{
        app.listen(3000,()=>{
            console.log('connected to database, app listening on port 3000');
        });
    }
});

