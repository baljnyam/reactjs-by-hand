// In react
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
const container = document.getElementById("root")
ReactDOM.render(element, container)

// under the hood
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}​
const container = document.getElementById("root")​
const node = document.createElement(element.type)
node["title"] = element.props.title​
const text = document.createTextNode("")
text["nodeValue"] = element.props.children​
node.appendChild(text)
container.appendChild(node)


// Creating createElement function
//JSX to JS 

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}


// For example, createElement("div") returns:
// {
//   "type": "div",
//   "props": { "children": [] }
// }
// createElement("div", null, a) returns:

// {
//   "type": "div",
//   "props": { "children": [a] }
// }
// and createElement("div", null, a, b) returns:

// {
//   "type": "div",
//   "props": { "children": [a, b] }
// }

// React doesn’t wrap primitive values or create empty

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

// Call didact

const Didact = {
  createElement
}

const element = Didact.createElement(
  "div",
  { id: "foo" },
  Didact.createElement("a", "null", "bar"),
  Didact.createElement("b")
)

// need to babel needs to use our funtion in that purpose
// add following

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
  <a>bar</a>
  <b />
  </div>
)

// Create ReactDOM.render() function
ReactDOM.render(element, container)

// function render(element, container) {
//   // Todo create dom nodes
// }

// const Didact = {
//   createElement,
//   render,
// }

function render(element, container) {
  const dom = document.createElement(element.type)

  // assign the element props to the node

  const dom = element = element.type == "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(element.type)

  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })


  // if the element type is TEXT_ELEMENT we create a text node 
  element.props.children.forEach(child =>
    render(child, dom))

  constainer.appendChild(dom)
}


// Concurrent Mode code refactoring
​
// it may block the main thread for too long.
//
// element.props.children.forEach(child =>
//   render(child, dom)
// )

let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  //TODO
}

// Remove code from the render function
function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)
​
  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })
​
  return dom
}
​
function render(element, container) {
  // TODO set next unit of work
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
​

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
​
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
​
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null
​
  while (index < elements.length) {
    const element = elements[index]
​
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
​
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
​
    prevSibling = newFiber
    index++
  }
​
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}