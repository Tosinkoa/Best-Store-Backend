import express from "express";
import { multerImage } from "../../../LIB/multer.js";
import { AuthMiddleware } from "../../../Middlewares/GeneralMiddlewares.js";
import {
  cloudinaryImageDeleter,
  cloudinaryImageSaver,
} from "../../../ReusableFunctions/cloudinaryAction.js";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
import { validateProduct } from "../../../VALIDATOR/UserValidator/ProductValidator.js";
import { ProductQueries } from "./ProductQueries.js";

const router = express.Router();

/**
 * @todo Remove lga table
 * @todo Work on product images
 */

/** @Note Route to create new product */
router.post("/create-new-product", AuthMiddleware, async (req, res) => {
  const MAX_IMAGE_COUNT = 8;
  const PRODUCT_IMAGES = multerImage.array("product_image", MAX_IMAGE_COUNT);
  PRODUCT_IMAGES(req, res, async (err) => {
    let {
      category_id,
      sub_category_id,
      name,
      description,
      price,
      bargain,
      in_stock,
      crossed_out_price,
    } = req.body;
    const loggedInUser = req.session.user;

    // ----- Validate req body
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).json({ error: errorMessageGetter(error) });
    // ----- Check for multer error
    if (err?.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ error: "The max image size required is 5mb" });
    if (err) return res.status(400).json({ error: err });
    if (req.files.length < 3) return res.status(400).json({ error: "Min product image is 3" });
    if (req.files.length > 8)
      return res.status(400).json({ error: "Max product image required is 8" });
    if (!sub_category_id) sub_category_id = "0";
    try {
      const sellerExist = await ProductQueries.selectOneSeller(loggedInUser);
      if (sellerExist.rowCount < 1) {
        return res.status(403).json({ error: "Unauthorized, you're not a seller!" });
      }
      const categoryAndSubCategory = await ProductQueries.selectCategoryAndSubCategory([
        sub_category_id,
        category_id,
      ]);
      if (categoryAndSubCategory.rowCount < 1) {
        return res.status(400).json({ error: "Invalid category id!" });
      }

      const categoryAndSubCategoryData = categoryAndSubCategory.rows[0];
      if (
        categoryAndSubCategoryData.category_name !== "Others" &&
        !categoryAndSubCategoryData.sub_cat_names
      ) {
        return res.status(400).json({ error: "Invalid sub-category id!" });
      }

      const newProduct = await ProductQueries.insertNewProduct([
        name,
        description,
        price,
        bargain,
        in_stock,
        crossed_out_price || null,
        sellerExist.rows[0].seller_id,
        categoryAndSubCategoryData.category_id,
        categoryAndSubCategoryData.sub_category_id || null,
      ]);

      // ------ Save Product Images
      console.log("Uploading images to cloudinary...");
      const allProductImagesResult = await Promise.all(
        req.files.map(
          async (file) => await cloudinaryImageSaver(file.path, "/best_store/product_images")
        )
      );
      let productImagesToSave = [];
      allProductImagesResult.map(async (eachProductImage) => {
        productImagesToSave.push({
          image_url: eachProductImage.secure_url,
          image_key: eachProductImage.public_id,
        });
      });
      console.log(productImagesToSave);
      await ProductQueries.saveProductImages([newProduct.rows[0].id, productImagesToSave]);
      return res.status(200).json({ message: "Product added successfully!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error, try agin!" });
    }
  });
});

/**
 * @Note Route to edit product by product_id
 */
router.put("/edit-product/:product_id", AuthMiddleware, async (req, res) => {
  const MAX_IMAGE_COUNT = 8;
  const PRODUCT_IMAGES = multerImage.array("product_image", MAX_IMAGE_COUNT);
  PRODUCT_IMAGES(req, res, async (err) => {
    let {
      category_id,
      sub_category_id,
      name,
      description,
      price,
      bargain,
      in_stock,
      crossed_out_price,
    } = req.body;
    let { product_id } = req.params;
    product_id = parseInt(product_id);
    const loggedInUser = req.session.user;

    // ----- Check for multer error
    if (err?.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ error: "The max image size required is 5mb" });
    if (err) return res.status(400).send({ error: err });

    if (!product_id)
      return res.status(400).json({ error: "product_id is required and must be a number" });

    if (category_id && !sub_category_id) sub_category_id = "0";

    try {
      const sellerExist = await ProductQueries.selectOneSeller(loggedInUser);
      if (sellerExist.rowCount < 1) {
        return res.status(403).json({ error: "Unauthorized, you're not a seller!" });
      }

      // ---- Check if the sum incoming image(s) and already saved image are not more than 8
      const existingProductImages = await ProductQueries.selectImagesByProductID(product_id);
      if (existingProductImages.rowCount < 1)
        return res.status(400).json({ error: "Product didn't exist!" });
      if (req.files) {
        const existingImageLength = existingProductImages.rows[0].images.length;
        const sumOfNewAndExisitingImage = existingImageLength + req.files.length;
        if (sumOfNewAndExisitingImage > 8)
          return res.status(400).json({
            message: `Product image max is 8, you already have ${existingImageLength} and you're adding new ${req.files.length}`,
          });
      }

      // ---- Validate cartegory and sub cartegory id
      if (category_id) {
        const categoryAndSubCategory = await ProductQueries.selectCategoryAndSubCategory([
          sub_category_id,
          category_id,
        ]);

        let categoryID, subCategoryID;
        const categoryAndSubCategoryData = categoryAndSubCategory.rows[0];
        if (categoryAndSubCategory.rowCount < 1) {
          return res.status(400).json({ error: "Invalid category id!" });
        }
        if (
          categoryAndSubCategoryData.category_name !== "Others" &&
          !categoryAndSubCategoryData.sub_cat_names
        ) {
          return res.status(400).json({ error: "sub_category_id didnot match category_id!" });
        }
        categoryID = categoryAndSubCategoryData.category_id;
        subCategoryID = categoryAndSubCategoryData.sub_category_id;
      }

      const productData = await ProductQueries.getProductById(product_id);
      const theProductData = productData.rows[0];

      // ----- Save product details to database
      await ProductQueries.updateProduct([
        name || theProductData.name,
        description || theProductData.description,
        price || theProductData.price,
        bargain || theProductData.bargain,
        in_stock || theProductData.in_stock,
        crossed_out_price || theProductData.crossed_out_price,
        category_id || theProductData.category_id,
        sub_category_id || theProductData.sub_category_id,
        product_id,
      ]);

      // ------ If there is any image, save them to cloudinary
      if (req.files) {
        console.log("Uploading images to cloudinary...");
        const allProductImagesResult = await Promise.all(
          req.files.map(
            async (file) => await cloudinaryImageSaver(file.path, "/best_store/product_images")
          )
        );

        // --- Put all new image(s) in an array and join it with the existing one(s) in the database.
        let newProductImages = [];
        allProductImagesResult.map(async (eachProductImage) => {
          newProductImages.push({
            image_url: eachProductImage.secure_url,
            image_key: eachProductImage.public_id,
          });
        });

        const parsedExistingImages = existingProductImages.rows[0].images.map((eachImage) =>
          JSON.parse(eachImage)
        );

        const productImagesToSave = parsedExistingImages.concat(newProductImages);
        await ProductQueries.updateProductImages([productImagesToSave, product_id]);
      }

      return res.status(200).json({ message: "Product updated successfully!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error, try agin!" });
    }
  });
});

router.get("/get-a-product/:product_id", AuthMiddleware, async (req, res) => {
  let { product_id } = req.params;
  product_id = parseInt(product_id);

  if (!product_id)
    return res.status(400).json({ error: "product_id is required and must be a number" });
  try {
    let selectedProduct = await ProductQueries.selectProductDataById(product_id);
    if (selectedProduct.rowCount < 1) {
      return res.status(400).json({ error: "Product doesn't exist!" });
    }
    selectedProduct.rows[0].images = selectedProduct.rows[0].images.map((eachImage) =>
      JSON.parse(eachImage)
    );

    return res.status(200).json({ data: selectedProduct.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

// router.get("/get-all-products/:data_amount", AuthMiddleware, async (req, res) => {
router.get("/get-all-products/:data_amount", async (req, res) => {
  let { data_amount } = req.params;
  let { data_offset, sub_category_id } = req.query;

  data_amount = parseInt(data_amount);
  data_offset = parseInt(data_offset);

  if (!data_amount || data_amount > 50)
    return res.status(400).json({ error: "data_amount is required, max 50" });

  try {
    let allProducts;
    if (sub_category_id) {
      allProducts = await ProductQueries.selectAllProductDataBySubCategory([
        sub_category_id,
        data_amount,
        data_offset || 0,
      ]);
    } else {
      allProducts = await ProductQueries.selectAllProduct([data_amount, data_offset || 0]);
    }

    if (allProducts.rowCount < 1) return res.status(400).json({ error: "No product found!" });

    // Iterate over each item in the data array
    allProducts.rows.forEach((item) => {
      const images = item.images.map((imageString) => JSON.parse(imageString));
      item.images = images;
    });

    return res.status(200).json({ data: allProducts.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-a-seller-products/:data_amount", AuthMiddleware, async (req, res) => {
  let { data_amount } = req.params;
  let { data_offset } = req.query;
  const loggedInUser = req.session.user;

  data_amount = parseInt(data_amount);
  data_offset = parseInt(data_offset);

  if (!data_amount || data_amount > 50)
    return res.status(400).json({ error: "data_amount is required, max 50" });

  const sellerDetails = await ProductQueries.selectOneSeller(loggedInUser);
  if (sellerDetails.rowCount < 1) {
    return res.status(403).json({ error: "Unauthorized, you're not a seller!" });
  }
  try {
    const allProducts = await ProductQueries.selectAllProductBySellerID([
      sellerDetails.rows[0].seller_id,
      data_amount,
      data_offset || "0",
    ]);

    if (allProducts.rowCount < 1)
      return res.status(400).json({ error: "You have no product!" });

    // Iterate over each item in the data array
    allProducts.rows.forEach((item) => {
      const images = item?.images?.map((imageString) => JSON.parse(imageString));
      item.images = images;
    });

    return res.status(200).json({ data: allProducts.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.delete("/delete-product-image/:product_id", AuthMiddleware, async (req, res) => {
  let { product_id } = req.params;
  const { image_key } = req.body;
  product_id = parseInt(product_id);

  if (!image_key) return res.status(400).json({ error: "image_key is required!" });
  if (!product_id)
    return res.status(400).json({ error: "product_id is required and must be a number" });

  try {
    const productImages = await ProductQueries.selectImagesByProductID(product_id);

    if (productImages.rowCount < 1)
      return res.status(400).json({ error: "Product image not found!" });

    if (productImages.rows[0].images.length === 3)
      return res.json({
        error: "Unable to delete image, you need at least three images for a product!",
      });
    const filteredProductImages = await Promise.all(
      productImages.rows[0].images.map(async (eachProductImage) => {
        const eachParsedImage = JSON.parse(eachProductImage);
        if (eachParsedImage?.image_key === image_key) {
          try {
            await cloudinaryImageDeleter(
              eachParsedImage.image_key,
              "/best_store/product_images"
            );
            return null; // Indicate image was deleted
          } catch (error) {
            console.log(`Error occurred while deleting cloudinary image: ${error}`);
            throw new Error(`An error occurred while deleting image: ${error}`);
          }
        }
        return eachProductImage;
      })
    );

    // Remove null entries from the result array (indicating deleted images)
    const filteredProductImagesWithoutNull = filteredProductImages.filter(
      (image) => image !== null
    );

    await ProductQueries.updateProductImages([filteredProductImagesWithoutNull, product_id]);
    return res.json({ message: "Product image deleted sucessfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-all-categories", async (req, res) => {
  try {
    const allCategories = await ProductQueries.selectAllCategories();
    if (allCategories.rowCount < 1) {
      return res.status(400).json({ error: "No category found!" });
    }
    return res.status(200).json({ data: allCategories.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-all-sub-categories/:category_id", async (req, res) => {
  let { category_id } = req.params;
  category_id = parseInt(category_id);

  if (!category_id)
    return res.status(400).json({ error: "category_id is required and must be a number" });

  try {
    const subCategories = await ProductQueries.selectSubCategories(category_id);
    if (subCategories.rowCount < 1) {
      return res.status(400).json({ error: "No category found!" });
    }
    return res.status(200).json({ data: subCategories.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

// router.get("/get-hot-deals-products", async (req, res) => {
//   let { data_amount } = req.params;
//   let { data_offset, sub_category_id } = req.query;

//   data_amount = parseInt(data_amount);
//   data_offset = parseInt(data_offset);

//   if (!data_amount || data_amount > 50)
//     return res.status(400).json({ error: "data_amount is required, max 50" });

//   try {
//     let allProducts;
//     if (sub_category_id) {
//       allProducts = await ProductQueries.selectAllProductDataBySubCategory([
//         sub_category_id,
//         data_amount,
//         data_offset || 0,
//       ]);
//     } else {
//       allProducts = await ProductQueries.selectAllProduct([data_amount, data_offset || 0]);
//     }

//     if (allProducts.rowCount < 1) return res.status(400).json({ error: "No product found!" });

//     // Iterate over each item in the data array
//     allProducts.rows.forEach((item) => {
//       const images = item.images.map((imageString) => JSON.parse(imageString));
//       item.images = images;
//     });

//     return res.status(200).json({ data: allProducts.rows });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Server error, try agin!" });
//   }
// });

export default router;
