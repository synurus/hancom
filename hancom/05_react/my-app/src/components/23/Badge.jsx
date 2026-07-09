const Badge = ({text, type}) => {
    const color = type === "new" ? 'green' : 'crimson'

    return (
        <>
        <span style = {{backgroundColor: color, color: 'white'}}> {text} </span>
        </>
    )
}

export default Badge