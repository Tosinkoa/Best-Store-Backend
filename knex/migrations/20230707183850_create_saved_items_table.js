/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("saved_items");
  if (!hasTable) {
    await knex.schema.createTable("saved_items", (table) => {
      table.increments("id").primary();
      table.integer("user_id").references("users.id").unique();
      table.integer("product_id").references("products.id");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("saved_items");
  if (hasTable) {
    await knex.schema.dropTable("saved_items");
  }
};
