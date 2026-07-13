import videoBottom from '../../../../../assets/video_bottom.mp4'

const Footer = () => {
    return (
        <>
            <video
                src={videoBottom}
                controls
                style={{
                    width: '100%',
                    height: '20vh',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                }}
                autoplay
            >
            </video>
        </>
    )
}
export default Footer