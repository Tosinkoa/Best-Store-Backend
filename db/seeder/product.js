import pool from "../../src/LIB/DB-Client.js";

const addSellers = async () => {
  try {
    for (let i = 1; i < 26; i++) {
      const category_id = 1;
      const sub_category_id = 1;
      const name = `Product ${i}${i}${i}${i}${i}${i}${i}`;
      const description =
        "<p><strong>About this product:</strong></p><p><br></p><p>Occaecat aliqua veniam commodo eiusmod sint mollit velit ut velit anim ullamco. Dolore tempor labore culpa nisi in est mollit. Duis Lorem ea irure do do nostrud. Ut ad consectetur aliqua laboris ex aliquip aliquip pariatur enim.</p><p><br></p><p>Occaecat aute aliquip aliqua laborum irure culpa eu occaecat et. Non cupidatat magna ex fugiat aliquip dolor reprehenderit. Nisi qui veniam fugiat quis. Ullamco esse adipisicing laboris cillum cupidatat veniam dolor non laborum aliquip ut fugiat. Sunt culpa enim commodo duis nostrud velit aute ex enim aliquip.wk ew Occaecat aliqua veniam commodo eiusmod sint mollit velit ut velit anim ullamco. Dolore tempor labore culpa nisi in est mollit. Duis Lorem ea irure do do nostrud. Ut ad consectetur aliqua laboris ex aliquip aliquip pariatur enim.</p><p><br></p><p>Occaecat aute aliquip aliqua laborum irure culpa eu occaecat et. Non cupidatat magna ex fugiat aliquip dolor reprehenderit. Nisi qui veniam fugiat quis. Ullamco esse adipisicing laboris cillum cupidatat veniam dolor non laborum aliquip ut fugiat. Sunt culpa enim commodo duis nostrud velit aute ex enim aliquip.</p>";
      const price = 40_000_000;
      const bargain = true;
      const in_stock = 30;
      const seller_id = 1;
      const crossed_out_price = 50_000_000;
      const product_images = [
        {
          image_url:
            "https://res.cloudinary.com/dcasx7rnk/image/upload/v1701474050/best_store/product_images/qjg6ni7zsfbsjbbuzx2t.jpg",
          image_key: "best_store/product_images/qjg6ni7zsfbsjbbuzx2t",
        },
        {
          image_url:
            "https://res.cloudinary.com/dcasx7rnk/image/upload/v1701474049/best_store/product_images/e9im6fovd1oq9o4zacox.jpg",
          image_key: "best_store/product_images/e9im6fovd1oq9o4zacox",
        },
        {
          image_url:
            "https://res.cloudinary.com/dcasx7rnk/image/upload/v1701474049/best_store/product_images/sabhelfk5mnzpkelffhs.jpg",
          image_key: "best_store/product_images/sabhelfk5mnzpkelffhs",
        },
        {
          image_url:
            "https://res.cloudinary.com/dcasx7rnk/image/upload/v1701474049/best_store/product_images/awbbnx9mrxjmfdif8acj.jpg",
          image_key: "best_store/product_images/awbbnx9mrxjmfdif8acj",
        },
        {
          image_url:
            "https://res.cloudinary.com/dcasx7rnk/image/upload/v1701474049/best_store/product_images/xsmz8vmyvuehmsoakv76.jpg",
          image_key: "best_store/product_images/xsmz8vmyvuehmsoakv76",
        },
      ];

      const productResult = await pool.query(
        "INSERT INTO products(name, description, price, bargain, in_stock, crossed_out_price, seller_id, category_id, sub_category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          name,
          description,
          price,
          bargain,
          in_stock,
          crossed_out_price,
          seller_id,
          category_id,
          sub_category_id,
        ]
      );

      await pool.query("INSERT INTO product_images (product_id, images) VALUES($1, $2)", [
        productResult.rows[0].id,
        product_images,
      ]);

      console.log(`Product ${i} added successfully!`);
    }
  } catch (error) {
    console.log("Something went wrong:");
    console.log(error);
  }
};

addSellers();
