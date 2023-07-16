/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("sellers");
  if (!hasTable) {
    await knex.schema.createTable("sellers", (table) => {
      table.increments("id").primary();
      table.integer("user_id").references("users.id").unique();
      table.text("seller_image").nullable();
      table.text("store_logo").nullable();
      table.text("website").notNullable().unique();
      table.text("about").notNullable().unique();
      table.string("state").notNullable();
      table.string("city").notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("sellers");
  if (hasTable) {
    await knex.schema.dropTable("sellers");
  }
};
