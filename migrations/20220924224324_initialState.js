
export const up = (knex) => {
  return knex.schema
    .createTable('userPlays', function (table) {
      table.increments('id').notNullable().primary()
      table.enu('client', ['client-rvrb', 'client-ttl']).notNullable()
      table.string('user', 255).notNullable()
      table.string('provider', 255)
      table.string('songId', 255).notNullable()
      table.string('room', 255).notNullable()
      table.string('artist', 255).notNullable()
      table.string('title', 255).notNullable()
      table.integer('theme')
      table.timestamps(true, true, true)
      table.index(['songId'])
    })
    .createTable('playReactions', function (table) {
      table.increments('id').notNullable().primary()
      table.integer('play').notNullable()
      table.enu('reaction', ['dope', 'nope', 'star', 'boofStar']).notNullable()
      table.string('reactionFrom', 255)
      table.timestamps(true, true, true)
    })
}

export const down = (knex) => {
  return knex.schema
    .dropTable('userPlays')
    .dropTable('playReactions')
}
