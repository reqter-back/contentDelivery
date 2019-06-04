const path = require('path')
const mergeGraphqlSchemas = require('merge-graphql-schemas')
const fileLoader = mergeGraphqlSchemas.fileLoader
const mergeResolvers = mergeGraphqlSchemas.mergeTypes
 
const resolvers = fileLoader(path.join(__dirname, '.'), { recursive: true })
 
module.exports = mergeResolvers(resolvers, { all: true })