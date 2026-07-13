import imageTop from '../../../../../assets/image_top.jpg'

const Header = () => {
    return (
        <div style={{
            width: '100%',
            height: '10vh',
            overflow: 'hidden'
        }}>
            <img
                src={imageTop}
                alt="menu-top"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
        </div>
    )
}
export default Header