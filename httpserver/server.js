import { map } from 'lodash'
import * as path from 'path'
import axios from 'axios'
import { request } from 'graphql-request'

const express = require('express')
const proxy = require('http-proxy-middleware')
const bodyParser = require('body-parser')
const CircularJSON = require('circular-json')

const app = express()
const port = 3000

app.use('/graphql', proxy({ target: 'http://localhost:4000', changeOrigin: true }))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/webapp.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/webapp.bundle.js'))
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')))

const getMatchesWithResults = (ids) => `
  {
    getMatches(ids: ${JSON.stringify(ids)}) {
      _id
      result {
        matchRes {
          home
          away
        }
      }
    }
  }
`

const merge = (arr1, arr2) => {
  return arr1.map(x => Object.assign(x, arr2.find(y => y._id == x._id)))
}

app.post('/predict', (req, res) => {
  const matchesToPredict = req.body

  axios.post(
    'http://localhost:7000/predict',
    matchesToPredict
  ).then(res2 => {
    const matchWithPredictions = res2.data

    const ids = map(matchWithPredictions, match => match._id)

    request(
      'http://localhost:4000/graphql',
      getMatchesWithResults(ids)
    ).then(data => {
      const matchesWithResults = data.getMatches
      console.log('Matches with results length', matchesWithResults.length)
      console.log('matchWithPredictions length', matchWithPredictions.length)
      const mergedMatches = merge(matchWithPredictions, matchesWithResults)
      console.log('mergedMatches length', mergedMatches.length)
      res.send(CircularJSON.stringify(mergedMatches))
    })

  }).catch(err => {
    console.log("ERROR:", err)
  })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
