const Profile = ({name, job = "개발자"}) => {
    const textToHex = (text) => {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hex = (hash & 0xFFFFFF).toString(16).padStart(6, '0');
        return `#${hex}`;
    }

    const sentenceWithColors = job.split(' ').map((word, index, arr) => (
        <span key={index}>
            <span style={{ color: textToHex(word) }}>
                {word}
            </span>
            {index < arr.length - 1 && ' '}
        </span>
    ));

    return (
        <>
        <h2>{name}</h2>
        <p>{sentenceWithColors}</p>
        </>
    )
}

export default Profile