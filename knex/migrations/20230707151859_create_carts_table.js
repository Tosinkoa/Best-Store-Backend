export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable("carts");
  if (!hasTable) {
    await knex.schema.createTable("carts", (table) => {
      table.increments("id").primary();
      table.integer("user_id").references("users.id").onDelete("CASCADE");
      table.integer("product_count").notNullable();
    });
  }
};

export const down = async (knex) => {
  const hasTable = await knex.schema.hasTable("carts");
  if (hasTable) {
    await knex.schema.dropTable("carts");
  }
};
