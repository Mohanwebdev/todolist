const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');


var custom='';
// database connection
mongoose.connect('mongodb://localhost:27017/todolist');

const itemSchema= new mongoose.Schema({
   item : String
});

const customSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

 
// let customList = custom+"List";
const itemList = mongoose.model('item', itemSchema);
 const  customList = mongoose.model('custom', customSchema);
 const customListName= mongoose.model('customList',itemSchema);

 
 const welcome= new itemList({
    item: 'welcome'
    });
     const newItem= new itemList({
    item: 'click "+" to add a new item'
    });

 const defaultItems= [welcome,newItem];

  

// date function
let date= new Date();
let options={
    weekday:'long',
    day:'numeric',
    month:'long'
};
let day = date.toLocaleDateString('en-US',options);


// home route 
app.get('/',function(req,res){
    

itemList.find({},function(err,results){
customListName.find({},function(err,foundList){

res.render('list',{today:day, newList: results, customItemList:foundList});
});
});
});

//custom list route
app.get('/:customroute',function(req,res){
    
         var custom=_.capitalize(req.params.customroute);
      
          
        customList.findOne({name:custom},function(err,results){
            if(!results){
                  const newItem = new customList({
                 name: custom,
                items:  defaultItems
            });

            newItem.save();
                res.redirect('/'+custom);
                
            }
           
            else{
                customListName.find({},function(err,foundList){
        
                res.render('list',{today:custom, newList:results.items,customItemList:foundList});
                 });
            }
            
    });
    
});



//post route to read new item from user
app.post('/',function (req,res){

    if(req.body.list==day){
        //home route list
       
        const newItem= new itemList({
    item: req.body.newItem
    });

    newItem.save();

res.redirect('/');
}


    else{
    //custom route list
      
     const newItem= new itemList({
    item: req.body.newItem
    });
    customList.findOne({name:req.body.list},function(err,results){
        results.items.push(newItem);
        results.save();
    })

    res.redirect('/'+req.body.list);
}

}  
);
    
//custom list creation

app.post('/customlist',function(req,res){
    let customItemName =_.capitalize(req.body.customItemName );
    const customName = new customListName ({
        item:customItemName
    });
    customName.save();
    res.redirect('/'+customItemName);

});



 //delete route to delete item from list
app.post('/delete',function(req,res){
    
    var deleteItem = req.body.checkbox;
    var listName = req.body.listName;

    if(listName===day){
        itemList.deleteMany({_id: deleteItem},function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect('/');
    }
    else{
        customList.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}},function(err){

            if(!err){
                res.redirect('/'+listName);
            }

        });
    }
});

app.post('/customListDelete',function(req,res){
    let deleteItem=req.body.customItem;
    
    customListName.deleteMany({item: deleteItem},function(err){
        if(!err){
            customList.deleteMany({name:deleteItem},function(err){
                if(!err){
                    res.redirect('/');
                }
            })
        }
    })
})









// port 
app.listen(3000,function(){
    console.log("server is started at port 3000");
})