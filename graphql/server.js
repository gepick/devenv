import { MongoClient, ObjectID } from 'mongodb'

var express = require('express')
var graphqlHTTP = require('express-graphql')
var { buildSchema } = require('graphql')

var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err
  var gepickDB = db.db("gepick")

  // Construct a schema, using GraphQL schema language
  var schema = buildSchema(`
    type Query {
      hello: String
      getAllMatches: [Match]
      getMatches(ids: [String]): [Match]
      getMatch(_id: String): Match
    }
    type Match {
      _id: String
      location: String
      league: String
      startTime: String
      hteam: String
      result: Result
    }
    type Result {
      matchRes: ResultEl
    }
    type ResultEl {
      home: Int
      away: Int
    }
  `)

  const Matches = gepickDB.collection("matches")

  // The root provides a resolver function for each API endpoint
  var root = {
    hello: () => {
      return 'Hello world!'
    },
    getMatches: async (props) => {
      console.log('PROPS', props)
      const matches = await Matches.aggregate([
        {
          $lookup: {
           from: 'results',
           localField: 'result',
           foreignField: '_id',
           as: 'result'
         }
        },
        {$unwind: '$result'}
      ]).toArray()

      console.log('matches', matches)

      return matches
    },
    getMatch: async (props) => {
      const _id = ObjectID(props._id[0])
      console.log('PROPS', _id)
      
      const match = await gepickDB.collection("matches").findOne({_id})
      
      console.log('MATCH', match)

      return match
    },
    getAllMatches: async() => await gepickDB.collection("matches").find({}).toArray()
  }

  var app = express()

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  }))

  app.listen(4000)

  console.log('Running a GraphQL API server at localhost:4000/graphql')

})
