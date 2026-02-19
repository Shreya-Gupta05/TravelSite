const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review"); 
const user=require("./user");

const listingSchema=new Schema({
       title:{
        type:String,
        required:true,
       },
       description:String,
       image: {
              filename: String,
              url: {
                type: String,
                default: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
              }
            },
       price:Number,
       location:String,
       country:String,
       reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
       },
      ],
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
      },
});
//Post SCHEMA MIDDLEWARE
//if listing is deleted then all its review should delete
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing=mongoose.model("Listing",listingSchema); //collection
module.exports=Listing;