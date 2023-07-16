/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("products");
  if (!hasTable) {
    await knex.schema.createTable("products", (table) => {
      table.increments("id").primary();
      table.integer("user_id").references("users.id").onDelete("CASCADE");
      table.text("product_name").notNullable();
      table.text("product_description").notNullable();
      table.integer("product_price").notNullable();
      table.text("product_cartegory").notNullable();
      table.integer("in_stock").nullable();
      table.specificType("product_images", "text[]").nullable().defaultTo("{}");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("products");
  if (hasTable) {
    await knex.schema.dropTable("products");
  }
};
