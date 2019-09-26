import React from 'react'
import styles from './Footer.module.scss'
import { ReactComponent as PixibayLogo } from '../../pixibayLogo.svg'

const Footer = () => (
   <footer className={styles.Footer}>
      <ul>
         <li>[S]=search</li>
         <li>[P]=pause</li>
         <li>[C]=clear</li>
         <li>[Enter]=submit</li>
      </ul>
      <span>
         Images provided by 
         <a href="https://pixabay.com/" target="_blank" rel="noopener noreferrer" ><PixibayLogo/></a>
      </span>

   </footer>
)

export default Footer