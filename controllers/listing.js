const Listing = require("../models/listing.js");

const index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

const renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

const createListing = async (req, res, next) => {
  let { path: url, filename } = req.file;

  //   let { title, description, image, price, location, country } = req.body;
  //   let newListing = new Listing({
  //     title: title,
  //     description: description,
  //     image: image,
  //     price: price,
  //     location: location,
  //     country: country,
  //   });

  // Better approach using name="listing[keyName]" in HTML
  let newListing = new Listing(req.body.listing);
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing added successfully!");
  res.redirect("/listings");
};

const showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Your requested listing could not be found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

const renderUpdateForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Your requested listing could not be found!");
    return res.redirect("/listings");
  }

  let existingImageUrl = listing.image.url;
  existingImageUrl = existingImageUrl.replace("upload/", "upload/w_250/"); // Cloudinary transformations

  res.render("listings/edit.ejs", { listing, existingImageUrl });
};

const updateListing = async (req, res) => {
  let { id } = req.params;

  //   let {
  //     title: newTitle,
  //     description: newDesc,
  //     image: newImg,
  //     price: newPrice,
  //     location: newLoc,
  //     country: newCountry,
  //   } = req.body;

  //   await Listing.findByIdAndUpdate(
  //     id,
  //     {
  //       title: newTitle,
  //       description: newDesc,
  //       image: newImg,
  //       price: newPrice,
  //       location: newLoc,
  //       country: newCountry,
  //     },
  //     { runValidators: true }
  //   );

  // Better approach using name="listing[keyName]" in HTML
  let updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { runValidators: true }
  );

  if (typeof req.file !== "undefined") {
    let { path: url, filename } = req.file;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }

  req.flash("success", "Listing edited successfully!");
  res.redirect(`/listings/${id}`);
};

const destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};

module.exports = {
  index,
  renderNewForm,
  createListing,
  showListing,
  renderUpdateForm,
  updateListing,
  destroyListing,
};
