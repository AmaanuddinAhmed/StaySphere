const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const createReview = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = res.locals.currUser._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
};

const destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  let deletedReview = await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull operator removes all instances of a value/values based on specified condition

  console.log(deletedReview);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports = { createReview, destroyReview };
