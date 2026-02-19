const Listing=require('./models/listing');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be logged in to create new listing");
        return res.redirect("/login");
    }
    next();
};
module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    
    if(!res.locals.currUser || !listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};