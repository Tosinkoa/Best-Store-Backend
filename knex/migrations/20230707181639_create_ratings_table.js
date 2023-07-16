/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("ratings");
  if (!hasTable) {
    await knex.schema.createTable("ratings", (table) => {
      table.increments("id").primary();
      table.integer("rating").notNullable();
      table.integer("product_id").references("products.id").onDelete("CASCADE");
      table.text("review").nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("ratings");
  if (hasTable) {
    await knex.schema.dropTable("ratings");
  }
};
