const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main()
{
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
    res.send("hi i am root");
});


//index route
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

//create route
app.post("/listings",wrapAsync(async(req,res,next)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));


//update route
app.put("/listings/:id",wrapAsync(async(req,res,next)=>{
    
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data forlisting");
    }
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing},{ runValidators: true });
    res.redirect(`/listings/${id}`);
    
}));

//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleted= await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}));

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found"));
// });

//middleware
app.use((err,req,res,next)=>{
     let{statuscode=500,message="Something went wrong"}=err; //with default message and status code
    res.status(statuscode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});