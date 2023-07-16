/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("notifications");
  if (!hasTable) {
    await knex.schema.createTable("notifications", (table) => {
      table.increments("id").primary();
      table.integer("user_id").references("users.id").unique();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("notifications");
  if (hasTable) {
    await knex.schema.dropTable("notifications");
  }
};
