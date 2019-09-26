import React from 'react'
import styles from './Spinner.module.scss'
import loading from '../../loading.png'

const Spinner = () => (
   <div id="Loading" className={styles.Spinner}>
      <img src={loading} alt="Loading..."/>
   </div>
)

export default Spinner