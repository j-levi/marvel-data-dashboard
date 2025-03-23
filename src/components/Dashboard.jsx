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

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true)
      const ts = new Date().getTime()
      const hash = md5(ts + privateKey + publicKey)
      const limit = 20
      try {
        const response = await fetch(
          `https://gateway.marvel.com/v1/public/characters?limit=${limit}&ts=${ts}&apikey=${publicKey}&hash=${hash}`
        )
        const data = await response.json()
        setCharacters(data.data.results)
        setFilteredCharacters(data.data.results)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch data from Marvel API.')
      }
      setLoading(false)
    }

    fetchCharacters()
  }, [privateKey, publicKey])

  useEffect(() => {
    let filtered = characters

    // Filter by search query (by name)
    if (searchQuery) {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Additional filter: filter by first letter of name if selected
    if (filterLetter) {
      filtered = filtered.filter(character =>
        character.name.startsWith(filterLetter)
      )
    }

    setFilteredCharacters(filtered)
  }, [searchQuery, filterLetter, characters])

  // Compute summary statistics: total characters, average comics, and total series
  const totalCharacters = characters.length
  const totalComics = characters.reduce(
    (acc, char) => acc + (char.comics.available || 0),
    0
  )
  const averageComics = totalCharacters ? (totalComics / totalCharacters).toFixed(2) : 0
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
