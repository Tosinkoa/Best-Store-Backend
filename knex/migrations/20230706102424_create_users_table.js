/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.text("email").notNullable().unique();
      table.text("first_name").notNullable().unique();
      table.text("last_name").notNullable().unique();
      table.string("phone_number").notNullable().unique();
      table.boolean("is_seller").defaultTo(true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("users");
  if (hasTable) {
    await knex.schema.dropTable("users");
  }
};
