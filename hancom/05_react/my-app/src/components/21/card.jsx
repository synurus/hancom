import './Card.css'

const Card = ({title, desc, emoji}) => {
    return (
        <div className="card">
            <span>{title}</span>
            <h3>{desc}</h3>
            <p>{emoji}</p>
        </div>
    )
}

export default Card