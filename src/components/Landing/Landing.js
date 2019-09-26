import React from 'react'
import styles from './Landing.module.scss'

const {$} = window

const Landing = ({setShowBar}) => {
   function onBegin() {
      // select main + it's children
      let main = $('#Landing main')
      let header = main.children[0]
      let buttonWrap = main.children[1]

      // apply animation
      header.style.transform = 'translate(-80vw, 0)'
      header.style.opacity = 0
      
      buttonWrap.style.transform = 'translate(80vw, 0)'
      buttonWrap.style.opacity = 0
      
      main.style.transform = 'scale(1.5)'
      main.style.opacity = 0

      // (timeout 500ms) => enable SearchBar, focus it and reveal footer on pc only
      setTimeout(
         () => {
            // display main none
            main.style.display = 'none'
            let input = $('#SearchBar')
            let footer = $('footer')
            setShowBar(true)
            input.disabled = false
            input.focus()
            if(window.isMobile) {
               footer.firstChild.style.display = 'none'
            }
            footer.style.transform = 'translateY(0)'
            footer.style.opacity = 1
            
         },
         750
      )
   }
   return (
      <div id="Landing" className={styles.Landing}>
         <main>
            <header>
               <h1>Space Image</h1>      
               <h1>Visualizer</h1>
               <br/>
               <p>Ever wanted to look for images in space?</p>
               <p>Well now you can, let's begin this journey!</p>
            </header>
            <div className={styles.buttonWrap}>
               <button onClick={onBegin}>Begin</button>
            </div>
         </main>    
      </div>
   )
}

export default Landing