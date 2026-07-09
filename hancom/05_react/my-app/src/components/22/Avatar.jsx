const Avatar = ({name, online}) => {
    return (
        <>
            <h1>{name}</h1>
            {online && <p>🦖</p> }
        </>
    )
}

export default Avatar