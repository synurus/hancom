import {Button} from '@mui/material'

const SubmitButton = () => {
    return (
        <Button variant="contained" onClick={() => alert("눌러주셔서 감사합니다")}>   {/* variant=모양, onClick=동작 → 다 props */}
        눌러주세요!
        </Button>
    )
}
export default SubmitButton