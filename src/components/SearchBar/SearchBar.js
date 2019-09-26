import React, { useState, useRef } from 'react'
import styles from './SearchBar.module.scss'

const {$, hideInfo, showInfo} = window

const SearchBar = ({setSearchTerm, showBar, setShowBar}) => {
   const [intputField, setIntputField] = useState('')
   const input = useRef(null)
   const searchWrap = useRef(null)
   

   function onSubmit(e) {
      e.preventDefault()
      input.current.blur()
      setSearchTerm(intputField)
      setShowBar(false) 
   }


   function onWrapClick({target}) {
      // return if input not yet active
      if(input.current.disabled) return
      if(!showBar) {
         setShowBar(true)
         hideInfo()
         input.current.select()
      } else if(target !== input.current && target !== $(`.${styles.button}`)) {
         if(window.searchTerm) showInfo()
         setShowBar(false) 
      } 
   }

   return(
   <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.infoWrap}>
         <div className={styles.info}>
            <span id="imagesFound">
               Found: <span id="imagesFoundVal">0</span>
            </span>
            <span id="imagesShowing">
               Showing: <span id="imagesShowingVal">0</span>
            </span>
         </div>
      </div>
      <div id="searchWrap" ref={searchWrap} className={styles.searchWrap} show={String(showBar)} onClick={onWrapClick}>
         <input 
            ref={input}
            disabled={true}
            onChange={({target}) => setIntputField(target.value)}
            id="SearchBar"
            autoComplete="off"
         />
         <label id="label">Search term</label>
         {window.isMobile && (<div className={styles.button} onClick={onSubmit}>Submit</div>)}
      </div>
   </form>
   )
}

export default SearchBar