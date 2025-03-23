import React from 'react'

const Filters = ({ filterLetter, setFilterLetter }) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  return (
    <div className="filters">
      <label htmlFor="letterFilter">Filter by first letter: </label>
      <select
        id="letterFilter"
        value={filterLetter}
        onChange={(e) => setFilterLetter(e.target.value)}
      >
        <option value="">All</option>
        {letters.map(letter => (
          <option key={letter} value={letter}>
            {letter}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Filters
