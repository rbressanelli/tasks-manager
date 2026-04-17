import { forwardRef } from "react"
import styles from "./card.module.css"

const Card = forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div ref={ref} className={styles.card}>
            <p 
                onClick={(e) => {
                    e.stopPropagation();
                    props.onOpenModal?.();
                }} 
                className="material-symbols-outlined absolute right-4 text-outline hover:text-primary cursor-pointer text-gray-400 z-10 top-3 transition-colors"
            >
                edit
            </p>
            <p 
                onClick={(e) => {
                    e.stopPropagation();
                    props.onOpenDeleteModal?.();
                }} 
                className="material-symbols-outlined absolute right-4 text-outline hover:text-error cursor-pointer text-gray-300 z-10 top-12 transition-colors"
            >
                delete
            </p>

            <div className="pr-10">
                {props.children || 'Card Content'}
            </div>
        </div>
    )
})

export default Card