// Dashboard.jsx
import React, { useState, useEffect } from 'react'
import md5 from 'blueimp-md5'
import SearchBar from './SearchBar'
import Filters from './Filters'
import Card from './Card'

const Dashboard = () => {
  const [characters, setCharacters] = useState([])
  const [filteredCharacters, setFilteredCharacters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLetter, setFilterLetter] = useState('')

  // Read keys from environment variables
  const publicKey = import.meta.env.VITE_MARVEL_PUBLIC_KEY
  const privateKey = import.meta.env.VITE_MARVEL_PRIVATE_KEY

  // Log keys (make sure they are not empty; note: logging privateKey partially for security)
  console.log("publicKey:", publicKey)
  console.log("privateKey:", privateKey ? privateKey.slice(0, 5) + "..." : "undefined")

  // Use a dynamic timestamp (as a string)
  const ts = new Date().getTime().toString()
  console.log("timestamp:", ts)

  // Compute hash: md5(ts + privateKey + publicKey)
  const hash = md5(ts + privateKey + publicKey)

  // Construct the Marvel API URL
  const url = `https://gateway.marvel.com/v1/public/characters?limit=20&ts=${ts}&apikey=${publicKey}&hash=${hash}`

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true)
      console.log("Fetching data from:", url)
      try {
        const res = await fetch(url)
        if (!res.ok) {
          let details = ''
          try {
            const errorJson = await res.json()
            details = JSON.stringify(errorJson)
          } catch (jsonErr) {
            // If JSON parsing fails, leave details empty
          }
          throw new Error(`Marvel API error: ${res.status} - ${details}`)
        }

        const data = await res.json()
        if (!data?.data?.results) {
          throw new Error('Malformed API response')
        }

        setCharacters(data.data.results)
        setFilteredCharacters(data.data.results)
      } catch (err) {
        console.error("Fetch error:", err)
        // Provide a more instructive error message for ECONNREFUSED
        setError(
          'Failed to fetch data from Marvel API. Please check your internet connection, ensure that your domain (e.g. http://localhost:5173) is added as an Authorized Referrer in your Marvel Developer account, and verify that your API keys are valid. Check the console for details.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [url])

  // Filter characters based on search query and selected filter letter
  useEffect(() => {
    let filtered = characters

    if (searchQuery) {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterLetter) {
      filtered = filtered.filter(character =>
        character.name.startsWith(filterLetter)
      )
    }

    setFilteredCharacters(filtered)
  }, [searchQuery, filterLetter, characters])

  // Compute summary statistics
  const totalCharacters = characters.length
  const totalComics = characters.reduce(
    (acc, char) => acc + (char.comics.available || 0),
    0
  )
  const averageComics = totalCharacters
    ? (totalComics / totalCharacters).toFixed(2)
    : 0
  const totalSeries = characters.reduce(
    (acc, char) => acc + (char.series.available || 0),
    0
  )

  return (
    <div className="dashboard">
      <div className="stats">
        <div className="stat">
          <h3>Total Characters</h3>
          <p>{totalCharacters}</p>
        </div>
        <div className="stat">
          <h3>Average Comics per Character</h3>
          <p>{averageComics}</p>
        </div>
        <div className="stat">
          <h3>Total Series</h3>
          <p>{totalSeries}</p>
        </div>
      </div>

      <div className="controls">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Filters filterLetter={filterLetter} setFilterLetter={setFilterLetter} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="card-list">
        {filteredCharacters.map(character => (
          <Card key={character.id} character={character} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
