const express = require("express");
const router = express.Router();
const wrapAsync = require("../utills/wrapAsync.js");
const Listing = require("../models/listing.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  multerErrorHandler,
} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 }, // 100KB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Index, Create Route:
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    multerErrorHandler,
    validateListing,
    wrapAsync(listingController.createNewListing)
  );

// New Route:
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, Delete Route:
router
  .route("/:id")
  .get(wrapAsync(listingController.showEachListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    multerErrorHandler,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route:
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editSingleListing)
);

module.exports = router;
