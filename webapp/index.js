import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { map, filter, get } from 'lodash'

const graphql = axios.create({
  baseURL: '/graphql',
})

const MATCHES_IDS = `
  {
    getAllMatches {
      _id
    }
  }
`

const Statistics = ({matches}) => {

  return (
    <div>
      <div>TOTAL PREDICTIONS: {matches.length} </div>
    </div>
  )
}

const MatchesToPredict = ({ matches }) => {
  return (
   <div>
     {matches.map(({_id}) => <div>{_id}</div>)}
   </div>
  )
}

const MatchesWithPredictions = ({matches}) => {
  return (
    <div>
      {map(matches, ({ _id, predictions, result }) => {
        const results = get(result, 'matchRes', {})
        const { home, away } = results ? results : {}

        return (
          <div>{_id } : {predictions.home} : [{home}: {away}]</div>
        )
      })}
    </div>
  )
}

class App extends React.Component {
  state = {
    matches: [],
    macthesWithPredictions: [],
    filteredMatches: [],
  }

  async componentDidMount() {
    const res = await graphql.post('', { query: MATCHES_IDS })
    this.setState({matches: res.data.data.getAllMatches})
  }

  async predict() {
    const matchesWithPredictions = (await axios.post('/predict', this.state.matches)).data
    const filteredMatches = filter(matchesWithPredictions, (match) => {
      return match.predictions.home > 50
    })

    this.setState({ matchesWithPredictions, filteredMatches })
  }

  render() {
    const { matches, matchesWithPredictions, filteredMatches }  = this.state

    return (
      <div style={{display: 'flex'}}>
        <button onClick={()=>this.predict()}>predict</button>
        <MatchesToPredict matches={matches}/>
        <MatchesWithPredictions matches={matchesWithPredictions}/>
        <MatchesWithPredictions matches={filteredMatches}/>
        <Statistics matches={filteredMatches} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
