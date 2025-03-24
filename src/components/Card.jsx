//Card.jsx
import React from 'react'

const Card = ({ character }) => {
  const { name, thumbnail, description, comics } = character
  const imageUrl = `${thumbnail.path}.${thumbnail.extension}`

  return (
    <div className="card">
      <img src={imageUrl} alt={name} className="card-image" />
      <div className="card-content">
        <h3>{name}</h3>
        {description ? <p>{description}</p> : <p>No description available.</p>}
        <p>
          <strong>Comics Available:</strong> {comics.available}
        </p>
      </div>
    </div>
  )
}

export default Card
