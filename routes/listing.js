const express=require("express");
const router=express.Router();

const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const {isLoggedIn,isOwner}=require("../middlware.js")


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
};

router.get("/",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//create route
router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created !");
    res.redirect("/listings");
})
);

//update route
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing},{ runValidators: true });
    req.flash("success","Listing Updated !");
    res.redirect(`/listings/${id}`);
    
}));

//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleted= await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success","Listing Deleted !");
    res.redirect("/listings");
}));

module.exports=router;