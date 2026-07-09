import './Greeting.css'

const Greeting = ({name, text}) => {
    return (
        <>
        <h1 style={{ color: text }}>Hello! {name}!</h1>
        </>
    )
}

export default Greeting