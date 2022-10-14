const text = document.querySelector(".text")
const slips = document.querySelectorAll(".slip")
const showRegexBtn = document.querySelector(".showRegexBtn")
const generateBtn = document.querySelector(".generateBtn")

const transitionTime = 15

let isMouseDown = false
let mouse = {"x": 0, "y": 0}
let draggedList = null

let addToLink, getLinks // callbacks

function initSlips(_addToLink, _getLinks) {
  addToLink = _addToLink
  getLinks = _getLinks

  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)

  slips.forEach(slip => {
    const currentOption = slip.querySelector(".current")
    currentOption.addEventListener("mouseover", handleMouseOver)
    currentOption.addEventListener("mouseout", handleMouseOut)
    currentOption.addEventListener("mousedown", handleMouseDown)
  })

  generateBtn.addEventListener("click", generate)
}

function handleMouseOver(e) {
  if (isLinking()) return

  if (!isMouseDown) {
    e.currentTarget.parentElement.parentElement.classList.toggle("hover", true)
    text.classList.toggle("hasHover", true)
  }
}

function handleMouseOut(e) {
  if (isLinking()) return

  if (!isMouseDown) {
    e.currentTarget.parentElement.parentElement.classList.toggle("hover", false)
    text.classList.toggle("hasHover", false)
  }
}

function handleMouseDown(e) {
  e.preventDefault()

  if (isLinking()) {
    addToLink(e.currentTarget.parentElement.parentElement)
  } else {
    isMouseDown = true
    mouse.x = e.clientX
    mouse.y = e.clientY
    draggedList = e.currentTarget.parentElement
    draggedList.parentElement.classList.toggle("hover", true)
    const linkedSlips = getLinks(draggedList.parentElement)
    linkedSlips.forEach(slip => {
      slip.classList.toggle("hover", true)
    })
  }
}

function handleMouseMove(e) {
  if (isLinking()) return
  if (!isMouseDown) return
  
  e.preventDefault()
  let draggedListPos = parseInt(getComputedStyle(draggedList).getPropertyValue("top").replace("px", ""))
  draggedListPos -= (mouse.y - e.clientY)

  const slipsToMove = [draggedList.parentElement, ...getLinks(draggedList.parentElement)]

  slipsToMove.forEach(slip => {
    const list = slip.querySelector(".list")

    list.style.top = `${draggedListPos}px`
    mouse.y = e.clientY

    const listOptions = list.querySelectorAll(".option")
    const targetOption = getNearestOption(listOptions, draggedListPos)

    // remove stuff from current option
    const currentOption = list.querySelector(".current")
    currentOption.classList.toggle("current", false)
    currentOption.removeEventListener("mouseover", handleMouseOver)
    currentOption.removeEventListener("mouseout", handleMouseOut)
    currentOption.removeEventListener("mousedown", handleMouseDown)

    targetOption.classList.toggle("current", true)
    targetOption.parentElement.parentElement.style.width = `${targetOption.offsetWidth}px`
  })
}

function handleMouseUp(e) {
  if (isLinking()) return
  if (!isMouseDown) return
  isMouseDown = false
  
  let draggedListPos = parseInt(getComputedStyle(draggedList).getPropertyValue("top").replace("px", ""))

  const slipsToMove = [draggedList.parentElement, ...getLinks(draggedList.parentElement)]
  slipsToMove.forEach(slip => {
    const list = slip.querySelector(".list")

    const listOptions = list.querySelectorAll(".option")
    const targetOption = getNearestOption(listOptions, draggedListPos)

    // set top
    list.style.top = `-${targetOption.offsetTop}px`

    // cancel hover
    list.parentElement.classList.toggle("hover", false)

    // remove stuff from current option
    const currentOption = list.querySelector(".current")
    currentOption.classList.toggle("current", false)
    currentOption.removeEventListener("mouseover", handleMouseOver)
    currentOption.removeEventListener("mouseout", handleMouseOut)
    currentOption.removeEventListener("mousedown", handleMouseDown)

    // set new current option
    targetOption.classList.toggle("current", true)
    targetOption.addEventListener("mouseover", handleMouseOver)
    targetOption.addEventListener("mouseout", handleMouseOut)
    targetOption.addEventListener("mousedown", handleMouseDown)

    // account for regex
    if (showRegexBtn.checked) {
      targetOption.parentElement.parentElement.style.width = "auto"
      console.log(targetOption.parentElement.parentElement)
    }

    text.classList.toggle("hasHover", false)
  })
}

// function getNearestOption(listOptions, slipType, draggedListPos) {
function getNearestOption(listOptions, draggedListPos) {
  let minDist = Infinity
  let targetOption = null
  listOptions.forEach(option => {
    let dist
    // if (slipType === "words") {
      dist = Math.abs(draggedListPos + option.offsetTop)
    // } else {
    //   dist = Math.abs(draggedListPos + option.offsetLeft)
    // }

    if (dist < minDist) {
      minDist = dist
      targetOption = option
    }
  })
  return targetOption
}

function generate() {
  slips.forEach(slip => {
    const options = slip.querySelectorAll(".option")
    const chosenOption = options[Math.floor(Math.random() * options.length)]
    options.forEach(option => {
      option.classList.toggle("current", false)
      option.removeEventListener("mouseover", handleMouseOver)
      option.removeEventListener("mouseout", handleMouseOut)
      option.removeEventListener("mousedown", handleMouseDown)
    })
    chosenOption.classList.toggle("current", true)
    chosenOption.addEventListener("mouseover", handleMouseOver)
    chosenOption.addEventListener("mouseout", handleMouseOut)
    chosenOption.addEventListener("mousedown", handleMouseDown)

    // const slipType = slip.classList.contains("slip-words") ? "words" : "lines"
    const list = slip.querySelector(".list")
    list.style.transition = "top 0.15s ease-in-out, left 0.15s ease-in-out";
    setTimeout(() => {
      list.style.transition = "";
    }, transitionTime);
    // if (slipType === "words") {
      list.style.top = `-${chosenOption.offsetTop}px`
    // } else {
    //   list.style.left = `-${chosenOption.offsetLeft}px`
    // }

    if (showRegexBtn.checked) {
      slip.style.width = "auto"
    } else {
      slip.style.width = `${chosenOption.offsetWidth}px`
    }
  })
}

function isLinking() {
  return document.body.classList.contains("is-linking")
}

export { initSlips }