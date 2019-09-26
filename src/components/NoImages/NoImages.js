import React from 'react'
import styles from './NoImages.module.scss'


const NoImages = () => {

   return (
      <div id="NoImages" className={styles.NoImages}>
         <main>
            <h1>No images found for '<span id="noImagesFor"></span>'</h1>
            <p>Try another search term.</p>
            <button onClick={window.hideNoImages}>Ok</button>
         </main>
      </div>
   );
}

export default NoImages