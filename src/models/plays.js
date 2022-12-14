const tableName = 'userPlays'

export default (knex) => {
  return {
    add: async (user, room, artist, title, songId, provider, theme = null, client, popularity) => {
      const results = await knex(tableName)
        .insert({
          user,
          room,
          artist,
          title,
          songId,
          provider,
          theme,
          client,
          popularity
        })
      if (results.length > 0) return true
      return false
    },
    getPlays: async (period, filter, room, user) => {
      let filterValue = { user }
      if (filter === 'room') filterValue = { room }
      let endDate = new Date()
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      if (period === 'alltime') {
        startDate = new Date('1970', '1', '1')
      } else if (period === 'lastmonth') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      }
      return await knex(tableName)
        .whereBetween('createdAt', [startDate, endDate])
        .andWhere(filterValue)
    },
    getLast: async (user) => {
      return await knex(tableName)
        .where({ user })
        .orderBy('createdAt', 'desc')
        .first()
    },
    getCurrent: async (room) => {
      return await knex(tableName)
        .where({ room })
        .orderBy('createdAt', 'desc')
        .first()
    },
    getFirst: async (client, songId, room) => {
      return await knex(tableName)
        .where({ songId, client })
        .modify((queryBuilder) => {
          if (room) {
            queryBuilder.where({ room })
          }
        })
        .orderBy('createdAt', 'asc')
        .first()
    },
    getFirstText: async (client, title, artist, room) => {
      return await knex(tableName)
        .where({ title, artist, client })
        .modify((queryBuilder) => {
          if (room) {
            queryBuilder.where({ room })
          }
        })
        .orderBy('createdAt', 'asc')
        .first()
    }
  }
}
