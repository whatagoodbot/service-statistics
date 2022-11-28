
export const up = (knex) => {
  return knex.schema
    .alterTable('userPlays', table => {
      table.integer('popularity')
    })
}

export const down = (knex) => {
  return knex.schema
    .alterTable('userPlays', table => {
      table.dropColumn('popularity')
    })
}
