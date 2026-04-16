import { forwardRef } from "react"
import styles from "./card.module.css"

const Card = forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div ref={ref} className={styles.card}>
            <p>{props.children || 'Card'}</p>
        </div>
    )
})

export default Card